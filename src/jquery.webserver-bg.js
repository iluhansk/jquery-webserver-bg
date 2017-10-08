/**
 * jQuery Server Background Plugin
 * 
 * @link https://github.com/iluhansk/jquery-webserver-bg
 * @license https://github.com/iluhansk/jquery-webserver-bg/blob/master/LICENSE.md
 * @version 1.0
 * @author Ilya Perfilyev <ilya_perfi@mail.ru>
 * 
 * @param {jQuery} $
 */
;
(function ($, window, document, undefined) {

    var namespace = 'webserverBackground';

    var getter = {
        data: function () {
            var $this = $(this);
            var data = $this.data(namespace);
            if (!data || !data.target) {
                $.error('webserverBackground not initialized');
            }
            return data;
        },
        option: function () {
            arguments;
            var data = getter.data.call(this);
            var result = data;
            for (var i = 0; i < arguments.length; i++) {
                result = result[arguments[i]];
                if (typeof (result) === 'undefined') {
                    return result;
                }
            }
            return result;
        },
        pid: function () {
            return getter.option.call(this, 'private', 'pid');
        },
        delay: function () {
            return getter.option.call(this, 'check', 'delay');
        },
        online: function () {
            return getter.option.call(this, 'private', 'online');
        }
    };

    var setter = {
        option: function (value) {
            var $this = $(this);
            var data = getter.data.call(this);
            var result = data;
            if (!arguments.length) {
                return false;
            }
            if (arguments.length == 1) {
                return $this.data(namespace, value);
            }
            for (var i = 1; i < arguments.length - 1; i++) {
                if (typeof (result[arguments[i]]) === 'undefined') {
                    result[arguments[i]] = {};
                }
                result = result[arguments[i]];
            }
            result[arguments[arguments.length - 1]] = value;
            return $this.data(namespace, data);
        },
        pid: function (ans) {
            var pid = answer.getField(ans, 'processId');
            setter.option.call(this, pid, 'private', 'pid');
        },
        online: function (value) {
            return setter.option.call(this, value, 'private', 'online');
        }
    };

    var ajax = {
        start: {
            data: function () {
                var func = getter.option.call(this, 'start', 'getData');
                if (typeof func === 'function') {
                    return func.call(this);
                }
                return {
                    action: 'start'
                };
            },
            settings: function () {
                var $this = $(this);
                var startAjaxSettings = getter.option.call(this, 'start', 'ajax');
                var aData = ajax.start.data.call(this);
                if (aData) {
                    startAjaxSettings.data = aData;
                }
                if (!startAjaxSettings.url) {
                    if ($this.is('a')) {
                        startAjaxSettings.url = $this.attr('href');
                    }
                    if ($this.is('form')) {
                        startAjaxSettings.url = $this.attr('action');
                    }
                }
                if ($this.is('form')) {
                    startAjaxSettings.method = $this.attr('method');
                }
                startAjaxSettings.error = protectedMethods.ajaxError;
                startAjaxSettings.success = answer.parse;
                startAjaxSettings.complete = function () {};
                if (!startAjaxSettings.beforeSend) {
                    startAjaxSettings.beforeSend = methods.block;
                }
                //добавляем контекст
                startAjaxSettings.context = this;
                return startAjaxSettings;
            }
        },
        check: {
            data: function () {
                var func = getter.option.call(this, 'check', 'getData');
                if (typeof func === 'function') {
                    return func.call(this);
                }
                var pid = getter.pid.call(this);
                return {
                    action: 'check',
                    pid: pid
                };
            },
            settings: function () {
                var checkAjaxSettings = getter.option.call(this, 'check', 'ajax');
                if (!checkAjaxSettings.url) {
                    var startAjaxSettings = ajax.start.settings.call(this);
                    checkAjaxSettings.url = startAjaxSettings.url;
                }
                var aData = ajax.check.data.call(this);
                if (aData) {
                    checkAjaxSettings.data = aData;
                }
                checkAjaxSettings.error = protectedMethods.ajaxError;
                checkAjaxSettings.success = answer.parse;
                checkAjaxSettings.complete = function () {};
                //добавляем контекст
                checkAjaxSettings.context = this;
                return checkAjaxSettings;
            }
        }
    };

    var progress = {
        getContainer: function () {
            var progressSettings = getter.option.call(this, 'progress');
            if (progressSettings && progressSettings.container) {
                var c = $(this).find(progressSettings.container);
                if (c.length > 0) {
                    return c;
                } else {
                    return $(progressSettings.container).first();
                }
            }
            return $([]);
        },
        show: function (ans) {
            var progressSettings = getter.option.call(this, 'progress');
            if (progressSettings && progressSettings.print) {
                progressSettings.print.call(this, ans);
            }
            var container = progress.getContainer.call(this);
            container.show();
        },
        hide: function () {
            var container = progress.getContainer.call(this);
            container.hide();
        }
    };

    var protectedMethods = {
        isFunction: function (f) { //Является ли f функцией
            return f instanceof Function;
        },
        checkStatus: function () {
            var checkAjaxSettings = ajax.check.settings.call(this);
            event.trigger.call(this, 'beforeCheck');
            //console.log('checkAjaxSettings', checkAjaxSettings);
            $.ajax(checkAjaxSettings);
        },
        ajaxError: function (jqXHR, textStatus, errorThrown) { //внутренний(обязательный) обработчик ошибки json запроса
            //console.log(this,jqXHR, textStatus, errorThrown);
            protectedMethods.error.call(this, errorThrown);
        },
        error: function (message) { //внутренний(обязательный) обработчик возникновения ошибки (любой)
            event.trigger.call(this, 'error');
            var userError = getter.option.call(this, 'error', 'print');
            if (protectedMethods.isFunction(userError)) {
                userError.call(this, message);
            }
            protectedMethods.complete.call(this);
        },
        success: function () {
            event.trigger.call(this, 'success');
            var userSuccess = getter.option.call(this, 'success');
            if (protectedMethods.isFunction(userSuccess)) {
                userSuccess.call(this);
            }
            protectedMethods.complete.call(this);
        },
        complete: function () { //внутренний(обязательный) метод завершения цикла
            setter.online.call(this, false);
            event.trigger.call(this, 'complete');
            //Вызываем пользовательский обработчик завершения цикла из настроек
            var userComplete = getter.option.call(this, 'complete');
            if (protectedMethods.isFunction(userComplete)) {
                userComplete.call(this);
            }
        }
    };

    var answer = {
        getField : function(ans, type, defaultValue) {
            var fieldName = getter.option.call(this, 'json', 'fields', type);
            if(fieldName) {
                var fieldValue = ans[fieldName];
                if(fieldValue !== undefined) {
                    return fieldValue;
                }
            }
            return defaultValue;
        },
        getStatusType : function(status) {
            var statuses = getter.option.call(this, 'json', 'statuses');
            for(var st in statuses) if(statuses.hasOwnProperty(st)) {
                if(status == statuses[st]) {
                    return st;
                }
            }
            return false;
        },
        parse : function (ans) {
            var status = answer.getField(ans, 'status');
            var statusType = answer.getStatusType(status);
            if(statusType) {
                var method = answer.statuses[statusType];
                if(protectedMethods.isFunction(method)) {
                    return method.call(this, ans);
                }
            }
            var message = 'unknown status';
            protectedMethods.error.call(this, message);
        },
        statuses : {
            ok : function(ans) { // успешно стартанули процесс
                //Сохраняем номер процесса
                setter.pid.call(this, ans);
                //выводим нулевой прогресс
                progress.show.call(this, {percent: 0});
                var delay = getter.delay.call(this);
                setTimeout(protectedMethods.checkStatus.bind(this), delay);
            },
            done : function(ans) { // процесс успешно завершен
                protectedMethods.success.call(this);
            },
            pending : function(ans) { // процесс выполняется
                progress.show.call(this, ans);
                var delay = getter.option.call(this, 'check', 'delay');
                setTimeout(protectedMethods.checkStatus.bind(this), delay);
            },
            error : function(ans) { // возникла ошибка
                var message = answer.getField(ans, 'message', 'unknown error');
                protectedMethods.error.call(this, message);  
            }
        }
    };

    var event = {
        trigger: function (name) { //вызывает событие name
            var eventType = namespace + ':' + name;
            $(this).trigger(eventType);
        }
    };

    //Публичные методы
    var methods = {
        init: function (options) { //Инициализация плагина
            return this.each(function () {
                var $this = $(this);
                var data = $this.data(namespace);
                // Если плагин ещё не проинициализирован
                if (!data || !data.target) {
                    // Расширяем них с помощью параметров, которые были переданы
                    var settings = $.extend(true, $.fn.webserverBackground.options, options);
                    // Прописываем обязательное поле target (перезатираем)
                    settings.target = $this;
                    $this.data(namespace, settings);
                    if ($this.is('form')) {
                        $this.submit(function (event) {
                            event.preventDefault();
                            methods.start.call($this);
                            return false;
                        });
                    }
                    if ($this.is('a')) {
                        $this.click(function (event) {
                            event.preventDefault();
                            methods.start.call($this);
                            return false;
                        });
                    }
                }
            });
        },
        destroy: function () { //Удаление плагина
            return this.each(function () {
                var $this = $(this);
                var data = $this.data(namespace);
                $(window).unbind('.' + namespace);
                $this.removeData(namespace);
            });
        },
        start: function () { //Запуск процесса (старт)
            return this.each(function () {
                if (getter.online.call(this)) {
                    //Значит процесс уже запущен, дублировать нельзя!
                    return false;
                } else {
                    //Устанавливаем флаг активности
                    setter.online.call(this, true);
                    event.trigger.call(this, 'start');
                }
                var startAjaxSettings = ajax.start.settings.call(this);
                //console.log('startAjaxSettings', startAjaxSettings);
                $.ajax(startAjaxSettings);
            });
        },
        block: function () { //Блокировка элементов формы
            var $this = $(this);
            if ($this.is('form')) {
                $this.find('select, input, textarea').attr('disabled', 'disabled');
            }
        },
        unblock: function () { //Разблокировка элементов формы
            var $this = $(this);
            if ($this.is('form')) {
                $this.find('select, input, textarea').attr('disabled', false);
            }
        }
    };

    $.fn.webserverBackground = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' not exist in jQuery.webserverBackground');
        }
    };

    //Глобальные параметры по умолчанию
    $.fn.webserverBackground.options = {
        start: {//параметры запуска нового bg-процесса
            ajax: {//параметры ajax
                method: "POST",
                dataType: "json",
                beforeSend: function() {
                    var errorClear = getter.option.call(this, 'error', 'clear');
                    if (protectedMethods.isFunction(errorClear)) {
                        errorClear.call(this);
                    }
                }
            },
            getData: function () { //метод получения данных ajax запроса
                var $this = $(this);
                if ($this.is('form')) {
                    return $this.serialize();
                }
                return {
                    action: 'start'
                };
            }
        },
        check: {//параметры проверки статуса bg-процесса
            ajax: {//параметры ajax
                method: "POST",
                dataType: "json"
            },
            delay: 1000 //интервал между запросами проверки статуса bg-процесса
        },
        error: {
            container: '.error',
            template: '<div class="error"></div>',
            print : function (message) { //метод вывода ошибки
                var $this = $(this);
                if ($this.is('form')) {
                    var containerSelector = getter.option.call($this, 'error', 'container');
                    var errorContainer = $this.find(containerSelector).first();
                    if(!errorContainer.length) {
                        var template = getter.option.call($this, 'error', 'template');
                        $this.append(template);
                        errorContainer = $this.find(containerSelector).first();
                    }
                    if (errorContainer.length) {
                        errorContainer.html(message);
                    }
                }
            },
            clear : function() {
                var $this = $(this);
                var errorPrint = getter.option.call($this, 'error', 'print');
                if (protectedMethods.isFunction(errorPrint)) {
                    errorPrint.call(this, '');
                }
            }
        },
        success: function () { //обработчик успешного завершения процесса
            //console.log('default user success handler');
        },
        complete: function () { //итоговый обработчик завершения процесса
            //console.log('default user complete handler');
            progress.hide.call(this);
            methods.unblock.call(this);
        },
        progress: {//Параметры отображения прогресса
            container: '.progressContainer', //CSS селектор контейнера для отображения прогресса
            template: '<div class="progress progress-striped active"><div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width:0%"><span class="complition">0</span>%</div></div>',
            print: function (ans) {
                var percent = answer.getField(ans, 'percent');
                var container = progress.getContainer.call(this);
                if (container.length) {
                    var element = container.find('.progress');
                    if (!element.length) {
                        var template = getter.option.call(this, 'progress', 'template');
                        container.html(template);
                    }
                    container.find('.progress-bar').attr('aria-valuenow', percent).attr('style', "width:" + percent + "%");
                    container.find('.complition').html(percent);
                }
            }
        },
        json : { //настройки json-ответа сервера
            fields : {
                status : 'status', //Поле статуса процесса
                message : 'message', //Поле текста ошибки
                processId : 'pid', //Id процесса
                progress : 'procent' //Процент выполнения процесса (для вывода прогресса)
            }, 
            statuses : { //значения статусов
                ok : 'ok', // Успешный старт процесса
                done : 'done', //Успешное завершение процесса
                error : 'error', //Ошибка
                pending : 'pending' //Процесс выполняется
            }
        }
    };

})(jQuery);