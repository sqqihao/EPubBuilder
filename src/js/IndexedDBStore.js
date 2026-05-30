/**
 * @desc IndexedDB storage for EPUB files
 * 存储：EPUB Blob 二进制 + 元数据
 * 引用列表：最近10个文件
 */

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.IndexedDBStore = factory();
    }
}(this, function() {

    var DB_NAME = 'EPubBuilderDB';
    var DB_VERSION = 1;
    var STORE_EPUBS = 'epubs';
    var STORE_SETTINGS = 'settings';
    var SETTINGS_KEY = 'recentList';
    var MAX_RECENT = 10;

    var IndexedDBStore = function() {
        this.db = null;
    };

    /**
     * 打开数据库
     */
    IndexedDBStore.prototype.open = function(callback) {
        var _this = this;
        var request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = function(e) {
            console.error('IndexedDB open error:', e);
            callback && callback(e);
        };

        request.onsuccess = function(e) {
            _this.db = e.target.result;
            callback && callback(null, _this.db);
        };

        request.onupgradeneeded = function(e) {
            var db = e.target.result;

            // epub 存储仓库
            if (!db.objectStoreNames.contains(STORE_EPUBS)) {
                var store = db.createObjectStore(STORE_EPUBS, { keyPath: 'name' });
                store.createIndex('lastOpened', 'lastOpened', { unique: false });
            }

            // 设置存储仓库
            if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
                db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
            }
        };
    };

    /**
     * 保存 EPUB 到 IndexedDB
     * @param {string} name 文件名
     * @param {Blob} blob EPUB 二进制
     * @param {Function} callback
     */
    IndexedDBStore.prototype.saveEpub = function(name, blob, callback) {
        var _this = this;
        this.open(function(err, db) {
            if (err) {
                callback && callback(err);
                return;
            }

            var tx = db.transaction([STORE_EPUBS, STORE_SETTINGS], 'readwrite');
            var epubStore = tx.objectStore(STORE_EPUBS);
            var settingsStore = tx.objectStore(STORE_SETTINGS);

            // 存入 epubs store
            var record = {
                name: name,
                blob: blob,
                size: blob.size,
                lastOpened: Date.now()
            };
            epubStore.put(record);

            // 更新引用列表
            settingsStore.get(SETTINGS_KEY).onsuccess = function(e) {
                var settings = e.target.result || { key: SETTINGS_KEY, value: [] };
                var list = settings.value;

                // 移除旧引用（如果已存在则先移除）
                var idx = list.indexOf(name);
                if (idx !== -1) {
                    list.splice(idx, 1);
                }

                // 头部插入
                list.unshift(name);

                // 截断最大数量
                if (list.length > MAX_RECENT) {
                    list = list.slice(0, MAX_RECENT);
                }

                settingsStore.put({ key: SETTINGS_KEY, value: list });

                tx.oncomplete = function() {
                    callback && callback(null);
                };
            };

            tx.onerror = function(e) {
                console.error('IndexedDB save error:', e);
                callback && callback(e);
            };
        });
    };

    /**
     * 读取 EPUB Blob
     * @param {string} name
     * @param {Function} callback (err, blob)
     */
    IndexedDBStore.prototype.getEpub = function(name, callback) {
        var _this = this;
        this.open(function(err, db) {
            if (err) {
                callback && callback(err);
                return;
            }

            var tx = db.transaction(STORE_EPUBS, 'readonly');
            var store = tx.objectStore(STORE_EPUBS);
            var request = store.get(name);

            request.onsuccess = function(e) {
                var record = e.target.result;
                if (record) {
                    // 更新 lastOpened
                    _this._touch(name);
                    callback && callback(null, record.blob);
                } else {
                    callback && callback(new Error('File not found: ' + name));
                }
            };

            request.onerror = function(e) {
                callback && callback(e);
            };
        });
    };

    /**
     * 获取近期文件列表（元数据，不含 Blob）
     * @param {Function} callback (err, [{name, size, lastOpened}])
     */
    IndexedDBStore.prototype.getRecentList = function(callback) {
        this.open(function(err, db) {
            if (err) {
                callback && callback(err);
                return;
            }

            var tx = db.transaction(STORE_SETTINGS, 'readonly');
            var store = tx.objectStore(STORE_SETTINGS);
            var request = store.get(SETTINGS_KEY);

            request.onsuccess = function(e) {
                var settings = e.target.result;
                var names = settings ? settings.value : [];

                if (names.length === 0) {
                    callback && callback(null, []);
                    return;
                }

                // 读取每个文件的元数据
                var tx2 = db.transaction(STORE_EPUBS, 'readonly');
                var epubStore = tx2.objectStore(STORE_EPUBS);
                var results = [];

                names.forEach(function(name) {
                    var req = epubStore.get(name);
                    req.onsuccess = function(ev) {
                        var record = ev.target.result;
                        if (record) {
                            results.push({
                                name: record.name,
                                size: record.size,
                                lastOpened: record.lastOpened
                            });
                        }
                        if (results.length >= names.length) {
                            // 按 recentList 顺序排列
                            var ordered = names.map(function(n) {
                                return results.find(function(r) { return r.name === n; });
                            }).filter(Boolean);
                            callback && callback(null, ordered);
                        }
                    };
                });
            };

            request.onerror = function(e) {
                callback && callback(e);
            };
        });
    };

    /**
     * 删除单个 EPUB
     * @param {string} name
     * @param {Function} callback
     */
    IndexedDBStore.prototype.deleteEpub = function(name, callback) {
        var _this = this;
        this.open(function(err, db) {
            if (err) {
                callback && callback(err);
                return;
            }

            var tx = db.transaction([STORE_EPUBS, STORE_SETTINGS], 'readwrite');

            // 删除 blob
            tx.objectStore(STORE_EPUBS).delete(name);

            // 从 recentList 移除
            var settingsStore = tx.objectStore(STORE_SETTINGS);
            settingsStore.get(SETTINGS_KEY).onsuccess = function(e) {
                var settings = e.target.result;
                if (settings) {
                    var list = settings.value.filter(function(n) { return n !== name; });
                    settingsStore.put({ key: SETTINGS_KEY, value: list });
                }
                tx.oncomplete = function() {
                    callback && callback(null);
                };
            };

            tx.onerror = function(e) {
                callback && callback(e);
            };
        });
    };

    /**
     * 清除所有历史
     * @param {Function} callback
     */
    IndexedDBStore.prototype.clearAll = function(callback) {
        this.open(function(err, db) {
            if (err) {
                callback && callback(err);
                return;
            }

            var tx = db.transaction([STORE_EPUBS, STORE_SETTINGS], 'readwrite');
            tx.objectStore(STORE_EPUBS).clear();
            tx.objectStore(STORE_SETTINGS).clear();

            tx.oncomplete = function() {
                callback && callback(null);
            };

            tx.onerror = function(e) {
                callback && callback(e);
            };
        });
    };

    // 更新 lastOpened 时间（内部用）
    IndexedDBStore.prototype._touch = function(name) {
        this.open(function(err, db) {
            if (err) return;
            var tx = db.transaction(STORE_EPUBS, 'readwrite');
            var store = tx.objectStore(STORE_EPUBS);
            var req = store.get(name);
            req.onsuccess = function(e) {
                var record = e.target.result;
                if (record) {
                    record.lastOpened = Date.now();
                    store.put(record);
                }
            };
        });
    };

    return IndexedDBStore;
}));