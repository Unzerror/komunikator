var DCB = {
    debug:true
};
(function(){

    c_uservisit = 'digt_callback_user_visit';
    c_urlhistory = 'digt_callback_url_history';
    c_actsomepagevisit = 'digt_callback_act_some_pagevisit';
    c_actexitvisit = 'digt_callback_act_exitvisit';
    c_numberpage = 'digt_callback_act_numberpage';
    c_scrollingvisit = 'digt_callback_act_scrollingvisit';
    c_createorder = 'digt_callback_createorder';

    f_circle_selected = false;

    function addListener(obj, type, listener) {
        if (obj.addEventListener) {
            obj.addEventListener(type, listener, false);
            return true;
        } else if (obj.attachEvent) {
            obj.attachEvent('on' + type, listener);
            return true;
        }
        return false;
    }

    DCB.metrica = function () {     // scrolling 
        addListener(window.parent.window, 'scroll', function () {
            var sT = Number($(window.parent.window).scrollTop());
//            var cH = Number($(window.parent.document).height()-$(window.parent.window).height());
            var cH = window.parent.document.body.offsetHeight - window.parent.window.innerHeight;
            if (DCB.debug == true) console.log('DCB.metrica: sT='+sT+' cH='+cH+' (sT - scrollTop, cH - content height)');
//        sT = Math.trunc(sT);
//        cH = Math.trunc(cH);
        sT = sT | 0;
        cH = cH | 0;
            if (DCB.debug == true) console.log('DCB.metrica: truncated values: sT='+sT+' cH='+cH);
            if (sT > cH-10 && sT != 0)   // интервал в 10 пикселей (на случай если скроллинг сайта будет сделан не до самого конца)
            {
                if (DCB.incCookie(c_scrollingvisit) > 1)   // сработает N раз ==1 - сработает 1 раз 
                {
                    DCB.Create_order(msg_on_metrica);
                    if (DCB.debug == true) console.log('скролл до конца страницы');
                }
            }
        });
    };
    var c_default_expires =  new Date();
    var min_s = 30;
    c_default_expires.setTime(c_default_expires.getTime() + (min_s * 60 * 1000));
      
    DCB.setCookie = function (cookie_name, cookie_value, cookie_expires) // установка cookie
    {
        var c_exp = c_default_expires;
        console.log('DCB.setCookie: ',c_exp); 
        if (cookie_expires)
            c_exp = cookie_expires;
            console.log(c_exp);
        $.cookie.json = true;
        $.cookie(cookie_name, cookie_value, {expires: c_exp, path: '/'});
    };

    DCB.getCookie = function (cookie_name)  // получение cookie
    {
        $.cookie.json = true;
        return $.cookie(cookie_name);
    };

    DCB.checkCookie = function (cookie_name, cookie_value) // проверка куки
    {
        $.cookie.json = true;
        if (cookie = $.cookie(cookie_name))
            if (cookie_value)
                if (cookie == cookie_value)
                    return true
                else
                    return false;
            else
                return true;
        return false;
    };

    DCB.incCookie = function (cookie_name, cookie_expires)    //  инкремент куки
    {
        $.cookie.json = true;
        var cookie = DCB.getCookie(cookie_name);
        if (!cookie)
        {
            DCB.setCookie(cookie_name, 1, cookie_expires);
            return 1;
        }
        var cookie_n = Number(cookie) + 1;
        DCB.setCookie(cookie_name, cookie_n, cookie_expires);
        return cookie_n;
    };

    DCB.createObject = function (propName, propValue)
    {
        this[propName] = propValue;
    };

    DCB.user_visit = function ()                   // проверка посещения сайта клиентом
    {
        var ref_domain = window.parent.document.referrer == '' ? '' : window.parent.document.referrer.split('/')[2];
        var my_domain = location.hostname;
        if (DCB.incCookie(c_uservisit) > 1)
            if (ref_domain != my_domain)
                DCB.Create_order(msg_on_user_visit);
    };

    var timestamp = new Date().getTime().toString();
    var urlhistory;
    
    DCB.fill_urlhistory = function (){           // проверка history url
        urlhistory = DCB.getCookie(c_urlhistory);
        if (DCB.debug == true) console.log ('DCB.check_urlhistory: before push: ',urlhistory);
        if (!urlhistory)
            urlhistory = [];
        urlhistory.push({'timestamp': timestamp, 'url': window.location.toString()});
        if (DCB.debug == true) console.log ('DCB.check_urlhistory: after push: ',urlhistory);
        DCB.setCookie(c_urlhistory, urlhistory);
    };

    DCB.check_specificurl = function() {
         var url_1 = urlhistory;
        
        if (DCB.debug == true) console.log ('DCB.check_urlhistory: specificurl="'+specificurl+'"');
        if (DCB.debug == true) console.log ('urlhistory.length='+urlhistory.length);

        if (url_1.length > 0)         // проверка посещения определенной страницы сайта 
            if (url_1[url_1.length - 1].url == specificurl)    // http://localhost/index.html
                if (DCB.incCookie(c_actsomepagevisit) == 1) // >1 - показывать N раз 
                {
                    if (DCB.debug == true) console.log('это определенная страница');
                    DCB.Create_order(msg_on_specificpage);
                }
    };

    DCB.check_numberpage = function () {    // проверка кол-ва посещенных страниц 
        var url_2 = urlhistory;
        var number_key = url_2.length;
        
        if (number_key >= number_page)
        {
            if (DCB.incCookie(c_numberpage) == 1)            //  if(DCB.incCookie(c_numberpage) > 1) 
            {
                DCB.Create_order(msg_on_check_urlhistory);
                if (DCB.debug == true) console.log('это количество посещенных страниц');
            }
        }
    };

    DCB.user_activity2 = function () {     // проверка активности пользователя по скролу, нажатию на клавишу, движению мыши 

        act_time = ua_seconds;          // время проведения клиента на сайте 
        act_threshold = 5;
        act_threshold_f = true;

        act_timer = setTimeout(function ()
        {
            clearTimeout(act_timer);
            if (act_threshold_f == false)
            {
                DCB.Create_order(msg_on_user_activity2);
                if (DCB.debug == true) console.log('activ');
            }
        }, 1000 * act_time);

        $(window.parent.document).bind('mousemove keydown scroll', function ()
        {
            act_threshold_f = false;
            act_th_timer = setTimeout(function ()
            {
                act_threshold_f = true;
                clearTimeout(act_th_timer);
            }, 1000 * act_threshold);
        });
    };

    DCB.user_exit = function ()  // уход со страницы сайта 
    {

        window.onbeforeunload = function () {
            if (DCB.incCookie(c_actexitvisit) == 2)
            {
                return msg_on_user_exit;
                if (DCB.debug == true) console.log('уход со страницы');
            }
        };
    };

    DCB.selectcolor = function () // выбор цвета кнопки 
    {

        if ($('.DCB_icon_box').get(0))
        {
            $('.DCB_icon_box').css('background', '#' + color_hex_before);
            addListener($('.DCB_icon_box').get(0), 'mouseover', function () {
                $('.DCB_icon_box').css('background', '#' + color_hex_after);
            });
            addListener($('.DCB_icon_box').get(0), 'mouseout', function () {
                $('.DCB_icon_box').css('background', '#' + color_hex_before);
            });
        }
        if (color_hex_before.toUpperCase() == "FFFFFF" || color_hex_after.toUpperCase() == "FFFFFF") {
            $('.DCB_icon1').css('color', '#000000');
        }
    };

    DCB.get_mobver_prefix = function()  //подмена стилей кнопки в зависимости от типа устройства
    {
        if(f_mobile_version == true)
            return "mobile/"
        else
            return "";
    };

    DCB.setFocus = function() // установка фокуса на поле ввода номера
    {
        $('#Number_calling_2240965432').css('outline','none'); //убрать рамку с поля input
	setTimeout(function()
	 {
	    $('input[name="Number"]').focus()
	 }, 3000);
	console.log('focus input type text');
    };

    DCB.setFramePosSize = function (x,y,width,height)
    {
        window.parent.document.getElementById('komunikatorCallbackFrame').width=width;
        window.parent.document.getElementById('komunikatorCallbackFrame').height=height;
        window.parent.document.getElementById('komunikatorCallbackDiv').style.width=width+'px';
        window.parent.document.getElementById('komunikatorCallbackDiv').style.height=height+'px';
        window.parent.document.getElementById('komunikatorCallbackDiv').style.left=x+'px';
        window.parent.document.getElementById('komunikatorCallbackDiv').style.top=y+'px';
    };

    DCB.correctScreen = function()           // определение размеров экрана
    {
        //var client_w = $(window.parent.document.documentElement).width();
        //var client_h = $(window.parent.document.documentElement).height();
        var win_w = window.parent.window.innerWidth;
        var win_h = window.parent.window.innerHeight;
        var doc_w = window.parent.document.body.offsetWidth;
        var doc_h = window.parent.document.body.offsetHeight;
    //    var aspect = screen.width/screen.height;
        if (DCB.debug == true) console.log('DCB.correctScreen win_w=',win_w,' win_h=',win_h);

	if (f_mobile_version == true)
	{ // действия для мобильной версии
            if($('.DCB_icon_box').get(0))
            {
                if($('.DCB_icon_box').css('display' ) == 'none' && work_status == 'online')
                { // модальное окно
                    DCB.setFramePosSize(0,0,win_w,win_h);
                } else
                { // кнопка
                    DCB.setFramePosSize(win_w-450,win_h-190,450,190);
                }
            }
        } else { // действия для настольной версии
    	    if ($('.DCB_icon_box').get(0))
            {
                if ($('.DCB_icon_box').css('display') == 'none' && work_status == 'online')
                {
                    DCB.setFramePosSize(0,0,win_w,win_h);
	        } else {
                    if (f_circle_selected == true)
                    {
                        DCB.setFramePosSize(win_w-300-win_h*0.07,win_h-174-win_h*0.07,300,74);
                    } else {
                        DCB.setFramePosSize(win_w-74-win_h*0.07,win_h-174-win_h*0.07,74,74);
                    }
                }
	    }
        }
    };

    DCB.begin = function () {
        $("head").prepend("<style type=\"text/css\">" +
            "@font-face {\n" +
            "\tfont-family: \"FontAwesome\";\n" +
            "\tfont-weight: normal;\n" +
            "\tfont-style: normal;\n" +
            "\tsrc: url('"+dcb_id_server+"/callback/font-awesome-4.3.0/fonts/fontawesome-webfont.eot?v=4.3.0');\n" +
            "\tsrc: url('"+dcb_id_server+"/callback/font-awesome-4.3.0/fonts/fontawesome-webfont.eot?#iefix&v=4.3.0') format('embedded-opentype'),  url('"+dcb_id_server+"/callback/font-awesome-4.3.0/fonts/fontawesome-webfont.woff2?v=4.3.0') format('woff2'),  url('"+dcb_id_server+"/callback/font-awesome-4.3.0/fonts/fontawesome-webfont.woff?v=4.3.0') format('woff'),  url('"+dcb_id_server+"/callback/font-awesome-4.3.0/fonts/fontawesome-webfont.ttf?v=4.3.0') format('truetype'),  url('"+dcb_id_server+"/callback/font-awesome-4.3.0/fonts/fontawesome-webfont.svg?v=4.3.0#fontawesomeregular') format('svg');\n" +
            "}\n" +
            "</style>\n");
        $(document).ready(function ()
        {
            $('body').append('<div id="dcb_id" class="dcb"></div>');
            if(f_mobile_version == false)
            {
                var phonebtn = '<i class="DCB_ball DCB_icon1 fa fa-phone fa-3x"></i><div id="podskazka_3874990613" class="DCB_bubble_1093358732">Хотите, Мы перезвоним</br>  Вам за '+dcb_sec+' секунд?</div>';
            } else {
                var phonebtn = '<div class="DCB_text_in_button_mobile">Перезвоним Вам</br> за '+dcb_sec+' секунд!</div><div id="btn_png" class="DCB_callback_png">'+
                    '<center><div class="fa fa-phone fa-flip-horizontal fa-4x" style="color:white;"></div></center></div>';
            }
            $('#dcb_id').append
            (
                '<div id="circle" class="DCB_icon_box" onClick="DCB.Create_order(undefined,true);">'+phonebtn+'<div style="display: none;"><div class="box-modal" id="win_order_7503523488">' +
                '<div class="DCB_mod_header"><div class="box-modal_close arcticmodal-close">X</div></div>' +
                '<div class="DCB_mod_body" id="win_order_content_9268377087"></div><div class="DCB_mod_footer" id="podpic_komunikator_1749966526"><div class="DCB_text_silka_komunicator">Работает на технологии</div>' +
                '<a href="https://komunikator.ru/?utm_source=callback&utm_medium=extensions&utm_campaign=callback" target="_blank"><div class="DCB_some_background"></div></a></div></div>'
            );
            $('#circle').mouseover(function(){
                f_circle_selected = true;
                DCB.correctScreen();
            });
            $('#circle').mouseout(function(){
                f_circle_selected = false;
                DCB.correctScreen();
            });
            DCB.selectcolor();   // приоритет вызова функций 
            DCB.correctScreen();
            DCB.setFocus(); // установка курсора в поле ввода номера
            DCB.fill_urlhistory();
            DCB.begin2 = function ()
            {
                    if (on_metrica == true)
                        DCB.metrica();
                    if (on_user_activity2 == true)
                        DCB.user_activity2();
                    if (on_check_urlhistory == true)
                        DCB.check_specificurl();
                    if (on_user_visit == true)
                        DCB.user_visit();
                    if (on_check_numberpage == true)
                        DCB.check_numberpage();
                    if (on_user_exit == true)
                        DCB.user_exit();
                    addListener(window.parent.window, 'resize', function () {
                        DCB.correctScreen();
                    });
                    addListener(window.parent.window, 'scroll', function () {
                        DCB.correctScreen();
                    });
                    addListener(window.parent.window, 'load', function () {
                        DCB.correctScreen();
                        DCB.setFocus();
                    });
            };
            DCB.FirstCheckWorkTime();
        });
    };


    DCB.kf = function () {   // готовность загрузки js css 
        DCB.k--;
        if (DCB.k == 0)
        {
            DCB.begin();
        }
    };
    
    DCB.includeJS = function (f_url)   // подгрузка js
    {
        var js = document.createElement('script');
        js.type = 'text/javascript';
        js.async = false;
        js.src = f_url;
        js.onload = DCB.kf;
        js.onreadystatechange = function () {
            if (this.readyState == 'complete')
                DCB.kf();
        }
        var jsx = document.getElementsByTagName('script')[0];
        jsx.parentNode.insertBefore(js, jsx);
        return js;
    };

    DCB.includeCSS = function (f_url)    // подгрузка css
    {
        var css = document.createElement("link");
        css.rel = "stylesheet";
        css.type = "text/css";
        css.href = f_url;
        css.onload = DCB.kf;
        css.onreadystatechange = function () {
            if (this.readyState == 'complete')
                DCB.kf();
        }
        document.getElementsByTagName("head")[0].appendChild(css);
        return css;
    };

    var work_status = 'offline';
    var cancel_order = true;
    var jsonpCallback_datasuccess = 'false';        // значение параметра success возвращаемое через jsonpCallback()
    var jsonpCallback_done = 'false';               // true - ф-ция jsonpCallback() выполнилась; false - не выполнялась
    var Call_us_6760835097_disabled = false;
    var jsonpCallback_warning = '';

    DCB.Cancel_order = function ()         // отмена заказа звонка
    {
        cancel_order = true;
        $('.DCB_icon_box').css('display', 'block');
        DCB.correctScreen();           // корректируем iFrame
    };

    DCB.Create_order_checkcookie = function ()   // блокировка всплывающих окон по таймеру 

    {
        if (DCB.checkCookie(c_createorder) == true)
            return false;
        var c_createorder_exp = new Date();
        var c_createorder_exp_seconds = time_popup_blocker;           //5sec

        c_createorder_exp.setTime(c_createorder_exp.getTime() + (c_createorder_exp_seconds * 1000));
        if (DCB.debug == true) console.log(c_createorder_exp);
        DCB.setCookie(c_createorder, 'true', c_createorder_exp)
        return true;
    };

    DCB.Create_order = function (co_text, force)
    {
        // проверка частоты вызова ф-ции
        if (!force)
            if (DCB.Create_order_checkcookie() == false)
                return;
        // защита от повторного вызова
        if (cancel_order == false)
            return;
    // проверка рабочего времени
    if (work_status != 'online')
        return;
        cancel_order = false;
        // отрисовка
        $('.DCB_icon_box').css('display', 'none');          // прячем кнопку
        DCB.correctScreen();                        // корректируем iFrame
        $('#win_order_7503523488').arcticmodal({// показываем модальное окно   
            afterClose: function (data, el) {
                if (DCB.debug == true) console.log(data);
                DCB.Cancel_order();
            }
        });
        DCB.correctScreen();
        $('#win_order_content_9268377087').empty();    // очистка контекста модального окна

        if (co_text == undefined)
            co_text = 'Хотите, мы вам перезвоним за ' + dcb_sec + ' секунд?';      // замена текста в мод.окне

        $('#win_order_content_9268377087').append('<div id="zagolovok_order_0353271466" class="DCB_text_zagolovka_order">' + co_text + '</div>' +
                '<div style="display:inline-block;width:100%;text-align:center;"><input type="tel" name="Number" id="Number_calling_2240965432" size="35" maxlength="25" placeholder="+7 ХХХ ХХХ ХХ ХХ" class="DCB_text_message">' +
                '<input type="button" value="Звоните !" id="Call_us_6760835097" class="DCB_button_calling" onClick="DCB.Show_timer();"' + (Call_us_6760835097_disabled ? ' disabled' : '') + '></div>' +
                '<div id="calling_free_5164231155" ><div class="DCB_text_call_free">Звонок бесплатный</div><div id="ahtyng_5031613510" class="DCB_trevoga"></div><div id="Help_us_window_0685353415" style="display: none"><div class="DCB_help_federation_number_text" id="Help_us_text_9868532398"></div></div></div>');

    DCB.button_calling_color(!Call_us_6760835097_disabled);
        DCB.button_calling_print_time;
        $('#podpic_komunikator_1749966526').css('display', 'block');     // логотип комуникатора
        if(f_mobile_version == true)
        {
            $('.DCB_text_call_free').css('display','none');    //скрыть текст бесплатного звонка
            $('div .box-modal_close').css('display','none');   //скрыть кнопку закрыть модального окна
            $('#Help_us_text_9868532398').css('display','none');//скрыть подсказку формата федеральных номеров
        }
    };

    DCB.Show_timer = function ()                // показать таймер 
    {
        if (cancel_order == true)
            return; // проверяем не закрыли ли окно заказа звонка
        var phone = document.getElementById('Number_calling_2240965432').value;
        if (phone == "")
        {
            $('div .DCB_mod_header').empty();
            $('div .DCB_mod_header').append('Пожалуйста, введите номер.');

        } else
        {
            var re1 = phone.replace(/[\s-]+/g, '');         // проверка на валидность набора номера
            var numregexp = /^(8|\+7)(\d{10,15})$/;
            var valid = DCB.valid1(re1, numregexp);
            if (valid == true)
            {
                re1 = re1.replace(numregexp,"7$2");
                DCB.zapret();                               // запрет на нажатии кнопки заказа звонка
                // меняем форму ввода номера на таймер
                $('#win_order_content_9268377087').empty();
                $('#win_order_content_9268377087').append('<div class="DCB_text_zagolovka_order">Мы вам уже звоним!</div><div id="timer_9109060427" class="DCB_cntSeparator"></div>');
                DCB.countdown_init();
                DCB.countdown();

                $.jsonp({url: ""+ dcb_id_server + "/service/data.php?action=order_call&number=" + dcb_prefix + re1 + "&callback=DCB.jsonpCallback&call_back_id=" + call_back_id});
                //setTimeout(DCB.jsonpCallback({success:'false',warning:'hello, man'}),3000);
            } else
            {
                $('div .DCB_mod_header').empty();
                $('div .DCB_mod_header').append('Пожалуйста, введите номер в федеральном формате.');
                $('#Help_us_text_9868532398').empty();
                $('#Help_us_text_9868532398').append('Номера в федеральном формате<br>+7-XXX-XXX-XX-XX<br> 8-XXX-XXX-XX-XX</br>');

                $('#Number_calling_2240965432').on({//вкл. всплывающей подсказки по набору номера
                    mouseover: function ()
                    {
                        $('#Help_us_window_0685353415').css('display', 'block');
                    },
                    mouseout: function ()
                    {
                        $('#Help_us_window_0685353415').css('display', 'none');
                    }
                });
            }
        }
    };

    DCB.valid1 = function (param, regex)
    {
        var valid = regex.test(param);
        return valid;
    };

    DCB.countdown_init = function ()         // переменные таймера по заказу звонка
    {
        min = 0;
        sec = dcb_sec;
        milisec = 0;
        jsonpCallback_datasuccess = 'false';
        jsonpCallback_done = 'false';
    };

    DCB.countdown = function ()        // таймер 
    {
        if (cancel_order == true)
        {
            clearInterval(inter);
            return;
        }
        milisec--;
        if (milisec < 0) {
            milisec = 99;
            sec--;
        }

        if (sec < 0) {
            sec = 59;
            min--;
        }

        time = (min < 10 ? "0" + min : min) + ":" +
                (sec < 10 ? "0" + sec : sec) + "," +
                (milisec < 10 ? "0" + milisec : milisec) + " сек";

        if ($('#timer_9109060427'))
            $('#timer_9109060427').html(time);

        if ((min <= 0 && sec <= 0 && milisec <= 0) || jsonpCallback_done == 'true')
        {
            clearInterval(inter);
            // меняем таймер на текст "извините"   

            if (DCB.debug == true) console.log('jsonpCallback_datasuccess=' + jsonpCallback_datasuccess);
            if (DCB.debug == true) console.log('jsonpCallback_done=' + jsonpCallback_done);
            if (DCB.debug == true) console.log('jsonpCallback_warning=' + jsonpCallback_warning);
            $('#win_order_content_9268377087').empty();

            if (jsonpCallback_datasuccess == 'false' && jsonpCallback_done == 'true')
            {
                // ответ от сервера пришел, но звонок совершить сейчас невозможно  
                $('#win_order_content_9268377087').append('<div class="DCB_text_zagolovka_order">Извините, похоже никого нет в офисе.</div><div class="DCB_perezvon" id="auto_otvet_perezvon_0661029074"><br>Мы обязательно перезвоним Вам в течение суток.</br></div>');
            }
            if (jsonpCallback_datasuccess == 'true')
            {
                // мы вам звоним, все в порядке
                $('#win_order_content_9268377087').empty();
                $('#win_order_content_9268377087').append('<div class="DCB_text_zagolovka_order">Спасибо за использование нашего сервиса.</div><div class="DCB_podrobnee" id="yznai_o_technologii_5324782904">Узнайте <a href="https://komunikator.ru/?utm_source=callback&utm_medium=extensions&utm_campaign=callback" target="_blank">подробнее</a> о технологиях</div><a href="https://komunikator.ru/?utm_source=callback&utm_medium=extensions&utm_campaign=callback" target="_blank"><div class="DCB_bolshoi_komunicator"></div></a>');
                $('#podpic_komunikator_1749966526').css('display', 'none');
            }
            if (jsonpCallback_datasuccess == 'false' && jsonpCallback_done == 'false')
            {
                // время вышло и ответ от сервера не пришел 
                $('#win_order_content_9268377087').empty();
                $('#win_order_content_9268377087').append('<div class="DCB_text_zagolovka_order">Похоже что-то пошло не так.</div><div class="DCB_perezvon" id="auto_otvet_perezvon_0661029074"><br>Попробуйте позже.</br></div>');
            }
        } else
            inter = setTimeout(DCB.countdown, 10);
    };

    DCB.jsonpCallback = function (data) {  // запрос на сервер по заказу звонка 
        if (DCB.debug == true) console.log(data.success);
        jsonpCallback_done = 'true';
        jsonpCallback_datasuccess = data.success;
        jsonpCallback_warning = data.warning;

        if (data.warning)                    // критические ошибки 
            if (DCB.debug == true) console.log(data.warning);
    };

    var countdownTimer, seconds, minutes;

    DCB.zapret = function () {
        seconds = dcb_seconds;  // timer 30 sec     
        minutes = 0;
        countdownTimer = setInterval(DCB.secondPassed, 1000);
        $('#Call_us_6760835097').attr("disabled", true);
        Call_us_6760835097_disabled = true;
    };

    DCB.button_calling_color = function (enabled)  // true - темная, false - светло-серая (неактивна)
    {
        if (enabled)
        {
            $('.DCB_button_calling').css('background-color', '#4c4c4c');
        }
        else
        {
            $('.DCB_button_calling').css('background-color', '#BFBFBF');
        }
    };

    DCB.button_calling_print_time = function ()
    {
        if ($("#Call_us_6760835097") !== undefined && Call_us_6760835097_disabled)
            $("#Call_us_6760835097").val((minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds));
    };

    DCB.secondPassed = function () {         // таймер кнопки звноите!
        DCB.button_calling_color(false);
        if (seconds == 0)
            minutes--;
        else
            seconds--;
        DCB.button_calling_print_time();
        minutes = Math.round((seconds - 30) / 60);
        if (seconds <= 0 && minutes <= 0)
        {
            if ($("#Call_us_6760835097") !== undefined)
                $("#Call_us_6760835097").val('Звоните!');
            clearInterval(countdownTimer);
            $('#Call_us_6760835097').attr("disabled", false);
            Call_us_6760835097_disabled = false;
            DCB.button_calling_color(true);
        }
    };

    DCB.jsonpCallbackStatus = function (data) {  // проверка статуса рабочего времени 
        if (DCB.debug == true) console.log(data.status);
       // data.status = 'online';
    work_status = data.status;
        if (data.status == 'online' && cancel_order == true)
        {
            $('.DCB_icon_box').css('display', 'block');
        } else {
            $('.DCB_icon_box').css('display', 'none');
        }
    };

    DCB.CheckWorkTime = function () {
        //$.jsonp({url: "" + dcb_id_server + "/service/data.php?action=get_work_status&callback=DCB.jsonpCallbackStatus"});
        setTimeout(DCB.jsonpCallbackStatus({status:'online'}),100);
        setTimeout(DCB.CheckWorkTime, 60000);
    };

    DCB.FirstCheckWorkTime = function () {
        //$.jsonp({url: "" + dcb_id_server + "/service/data.php?action=get_work_status&callback=DCB.FirstCheckWorkTime_f"});
        setTimeout(DCB.FirstCheckWorkTime_f({status:'online'}),100);
    };
    DCB.FirstCheckWorkTime_f = function (data) {
    DCB.jsonpCallbackStatus(data);
    DCB.begin2();
    };

    // Внедряем объекты
    DCB.k = 9 - 1;
    digt_callback_url = dcb_id_server + '/callback';
    DCB.includeCSS(digt_callback_url + "/"+DCB.get_mobver_prefix()+"order_calling_style.css");
    DCB.includeCSS(digt_callback_url + "/font-awesome-4.3.0/css/font-awesome.css");
    DCB.includeCSS(digt_callback_url + "/js/arcticmodal/jquery.arcticmodal-0.3.css");
    DCB.includeCSS(digt_callback_url + "/"+DCB.get_mobver_prefix()+"js/arcticmodal/themes/komunikator.css");
    DCB.includeJS(digt_callback_url + "/js/jquery.min.js");
    DCB.includeJS(digt_callback_url + "/js/arcticmodal/jquery.arcticmodal-0.3.min.js");
    DCB.includeJS(digt_callback_url + "/js/jquery.jsonp-2.4.0.js");
    DCB.includeJS(digt_callback_url + "/js/detect.js");
    DCB.includeJS(digt_callback_url + "/js/jquery.cookie.js");
})();
