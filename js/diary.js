/* global settings, numeral, target, shlow, shhigh, coefs */

"use strict";

var events = [];
var cached_menus = {};

$(document).on("pageshow","#page-menu-info",function(){
    $('#page-menu-list').listview('refresh');
});

$(document).on("pagecreate","#page-eventslist-0",function(){
    var today = new Date();
    var weekago = new Date();
    weekago.setDate( weekago.getDate() - settings.period);
    
    $('#start-date-0').val( getDateString(weekago) );
    $('#end-date-0').val( getDateString(today) );
    
    loadEvents(0);
    
    $('#page-events-add-sugar').on('tap',function(){
        showNewSugarPage();
    });
    $('#page-events-add-remark').on('tap',function(){
        showNewRemarkPage();
    });
    $('.page-header').on("taphold",function(){
        var page = $(this).attr('id').substring(12);
        var doing = $(this).jqmData('doing');
        if (typeof doing==='undefined'){
            doing = 'collapse';
        }
        if (doing==='collapse'){
            $(this).jqmData('doing','expand');
        }else{
            $(this).jqmData('doing','collapse');
        }
        $('.events-list-'+page).collapsible( doing );
    });
    $('.interval-date').on({
        change: function(){
            //сначала вытащим id страницы
            var id = $(this).attr('id');
            var page = +id.substring(id.length-1,id.length);
            if (page===0){
                storeInterval();
            }
            loadEvents(page);
        }
    });
    $('#page-events-add-page').on('tap',function(){
        $('#events-new-menu').collapsible( "collapse" );
        if (exists(1) && exists(2)){
            return;
        }//Уже всё добавлено
        var page = 1;
        if (exists(1)){//Первая страница занята
            page = 2;
        }
        $('#start-date-'+page).val( $('#start-date-0').val() );
        $('#end-date-'+page).val($('#end-date-0').val());
        loadEvents(page);
        $.mobile.changePage( "#page-eventslist-"+page, { 
                transition: "flip"
            } );
    });
    $('#page-eventslist-0').on('swipeleft',function(){
        //Смотрим страницы справа
        if (exists(1) || exists(2)){
            //Показываем страницу справа
            var page = exists(1)?1:2;
            $.mobile.changePage( "#page-eventslist-"+page, { 
                transition: "flip"
            } );
        }
    });
});

$(document).on("pagecreate","#page-eventslist-1",function(){
    $('#page-eventslist-1').on('swipeleft',function(){
        if (exists(2)){
            //Показываем страницу справа
            $.mobile.changePage( "#page-eventslist-2", { 
                transition: "flip"
            } );
        }
    });
    $('#page-eventslist-1').on('swiperight',function(){
        //Страница справа есть всегда
        $.mobile.changePage( "#page-eventslist-0", { 
            transition: "flip",
            reverse: true
        } );
    });
    $('#page-eventslist-1-btn-delete').on('tap',function(){
        deletePage(1);
    });
});
$(document).on("pagecreate","#page-eventslist-2",function(){
    $('#page-eventslist-2').on('swiperight',function(){
        var page = 0;
        if (exists(1)){
            page = 1;
        }
        $.mobile.changePage( "#page-eventslist-"+page, { 
            transition: "flip",
            reverse: true
        } );
    });
    $('#page-eventslist-2-btn-delete').on('tap',function(){
        deletePage(2);
    });
});
function deletePage(page){
    delete events[page];
    $('#events-list-'+page).empty();
    $.mobile.changePage( "#page-eventslist-0", { 
        transition: "flip",
        reverse: true
    } );
}
$(document).on("pagecreate","#page-remark-sugar-info",function(){
    $('#page-RS-save').on('tap',function(){
        var id = $('#page-remark-sugar-info').jqmData('id');
        var page = $('#page-remark-sugar-info').jqmData('page');
        
        var rem = $('#page-RS-remark').val();
        var date = $('#page-RS-date').val();
        var time = $('#page-RS-time').val();
        var sh = $('#page-RS-sugar');
        if (sh.val().length===0){//Если вдруг удалили значение 
            sh.val(numeral(target.getView(settings.whole,settings.mmol))
                        .format(settings.mmol?'0.0':'0'));
        }
        var s;
        if ((id<0 && id===-2) || (id>0 && events[page][id].type===2)) {
            //Тут вытаскиваем СК
            s = new Sugar(5.6);
            s.setSugar(replaceComma(sh.val()),settings.whole, settings.mmol);
        }
        if ( ( ((id<0 && id===-1) || (id>0 && events[page][id].type===1)) && rem.length===0) || 
                date.length===0 || 
                time.length===0){
            alert('Какое-то поле не заполнено!');
            return;
        }
        $.mobile.changePage( "#page-eventslist-0", { 
            transition: "flip",
            reverse: true
        } );
        
        if (id<0){//Это добавление нового события
            switch (id){
                case -1: storeRemark(date+' '+time,rem); break;
                case -2: storeSugar(date+' '+time,rem,s.sugar); break;
            }
        }else{//Редактирование
            switch (events[page][id].type){
                case 1: editRemark(id, date+' '+time,rem); break;
                case 2: editSugar(id, date+' '+time,rem,s.sugar); break;
            }
        }
    });
    
    $('#page-RS-delete').on('tap',function(){
        if (confirm('Подтвердите удаление события из дневника')){
            var id = $('#page-remark-sugar-info').jqmData('id');
            var page = $('#page-remark-sugar-info').jqmData('page');
            deleteEvent(id,page);
        }
    });
    $('.select-all').on({
        focus: function() { 
            $(this).select(); 
        }
    });
});

$(document).on("pagecreate","#page-menu-info",function(){
    $('#page-menu-restore').on('tap',function(){
        var id = $('#page-menu-info').jqmData('id');
        var page = $('#page-menu-info').jqmData('page');
        restoreMenu(id,page);
    });
    
    $('#page-menu-delete').on('tap',function(){
        if (confirm('Подтвердите удаление события из дневника')){
            var id = $('#page-menu-info').jqmData('id');
            var page = $('#page-menu-info').jqmData('page');
            deleteEvent(id,page);
        }
    });
});

function restoreMenu(id,page){
    $.post("online.php?"+getSID(),
    {
        action   : 'restore menu',
        id       : id
    },
    function(data, status){
        if (status !== "success"){
            showErrorConnection();
        }else{
            try{
                if (JSON.parse(data)===1){
                    $.mobile.changePage( "#page-eventslist-"+page, { 
                        transition: "flip",
                        reverse: true
                    } );
                    if (confirm('Меню успешно восстановлено\nПерейти на страницу рассчёта?')){
                        window.location.href = "index.php";
                    }
                }else{
                    showError('Ошибка\n'+data);
                }
            }catch(error){
                showError(error+'\n'+data);
            }
        }
    });
}

function deleteEvent(id,page){
    $.post("online.php?"+getSID(),
    {
        action   : 'delete event',
        id       : id
    },
    function(data, status){
        if (status !== "success"){
            showErrorConnection();
        }else{
            try{
                if (JSON.parse(data)===1){
                    for(var i=0;i<3;i++){
                        if (exists(i) && typeof events[i][id]!=='undefined'){
                            //Придумать как искать, т.к. список прерывается заголовками дат
                            var p = $('#event-'+i+'-'+id);//Этот есть точно
                            var focusTo = p.prev();
                            if (focusTo.length===0){//Предыдущего нет, ищем след.
                                focusTo = p.next();
                                if (focusTo.length===0){//Ничего не нашли, список пуст
                                    loadEvents(i);
                                    continue;
                                }
                            }
                            loadEvents(i,+focusTo.attr('id').substring(8));
                        }
                    }

                    $.mobile.changePage( "#page-eventslist-"+page, { 
                        transition: "flip",
                        reverse: true
                    } );
                }else{
                    showError('Ошибка\n'+data);
                }
            }catch(error){
                showError(error+'\n'+data);
            }
        }
    });
}
function storeInterval(){
    var startSt = $('#start-date-0').val();
    var endSt   = $('#end-date-0').val();
    
    if (startSt.length===0 || endSt.length===0){
        return;
    }
    
    var diff = new Date(endSt).getTime() - new Date(startSt).getTime();
    if (diff<=0){
        return;
    }
    var days = diff/86400000;
    $.post("online.php?"+getSID(),
    {
        action  : 'store period',
        period  : days
    },function(data, status){
        if (status === "success"){
            try{
                if (JSON.parse(data)!==1){
                    showError(data);
                }
            }catch(error){
                showError(error+'\n'+data);
            }
        }else{
            showErrorConnection();
        }
    });
}
function loadEvents(page,scrollTo){
    //Делаем проверку, если даты не соответствуют формату,
    //то не грузим, но список очищаем.
    //Очищаем список
    var list = $('#events-list-'+page);
    list.empty();
    events[page] = {};
    var startSt = $('#start-date-'+page).val();
    var endSt   = $('#end-date-'+page).val();
    
    if (startSt.length===0 || endSt.length===0){
        return;
    }
    startSt += " 00:00";
    endSt   += " 00:00";
    
    //Загружаем меню в массив
    $.post("online.php?"+getSID(),
    {
        action: 'get diary',
        start : startSt,
        end   : endSt
    },
    function(data, status){
        if (status === "success"){
          try{
            var res = JSON.parse(data);
            var st = "";
            var dateHeader = "";
            var calors = 0;
            for(var i=0;i<res.length;i++){
                //var li;
                var dt = new Date(res[i].dt);
                if (dt.toLocaleDateString('ru-RU')!==dateHeader){
                    //Создаем новый заголовок
                    if (dateHeader!==''){//Создаем не первый раз, надо добавить окончание
                        //Перед окончанием вставляем итог по калориям
                        if (settings.calorlimit>0 && calors>0){
                            st += createLICalors(calors);
                            calors = 0;
                        }
                        st += "</ul></div>";
                    }
                    dateHeader = dt.toLocaleDateString('ru-RU');
                    st += '<div class="events-list-'+page+'" data-role="collapsible" data-collapsed="false" data-mini="true" '+
                    'data-inset="false" id="event-header-'+page+'-'+getDateString(dt)+'">'+
                    '<h3><div class="event-header">'+
                    dateHeader+'</div></h3><ul data-role="listview">';
                }
                switch(res[i].type){
                    case 2: var dt = new Date(res[i].dt);
                            events[page][res[i].id] = {
                                        type : 2,
                                        dt   : dt,
                                        rem  : res[i].rem,
                                        sh    : res[i].sh
                            };
                            st += createLISugar(page,res[i].id);
                            break;
                    case 1: var dt = new Date(res[i].dt);
                            events[page][res[i].id] = {
                                        type  : 1,
                                        dt    : dt,
                                        rem   : res[i].rem
                            };
                            st += createLIRemark(page,res[i].id);
                            break;
                    case 3: var dt = new Date(res[i].dt);
                            var coefs = new Coef( res[i].k1,res[i].k2,res[i].k3,
                                        res[i].sh1,res[i].sh2,settings.be );
                            var prod  = new MenuProd('', -1, res[i].weight, 
                                res[i].prot, res[i].fat, res[i].carb, res[i].gi,-1);
                            var dose = new Dose(prod,coefs);
                            calors += prod.getCalor();
                            events[page][res[i].id] = {
                                        type  : 3,
                                        dt    : dt,
                                        rem   : res[i].rem,
                                        coefs : coefs,
                                        prod  : prod,
                                        dose  : dose
                            };
                            st += createLIMenu(page,res[i].id);
                            break;
                }
            }
            if (settings.calorlimit>0 && calors>0){
                st += createLICalors(calors);
            }
            st += "</ul></div>";
            //list.append(st).collapsibleset('refresh');
            list.append(st);
            list.trigger("create");
            //list.listview("refresh");
            $('.events').on('taphold',function(){
                //Пробуем получить id
                var id_full = $(this).attr('id');
                if (typeof id_full !== 'undefined'){
                    var id = +id_full.substring(13);
                    var page = +$(this).attr('id').substring(11,12);
                    switch (events[page][id].type){
                        case 1: showRemarkPage(id,page); break;
                        case 2: showSugarPage(id,page); break;
                        case 3: showMenuPage(id,page); break;
                    }
                }else{
                    //Открываем панель деталей по дню
                    showCalorsDetail( $(this) );
                }
            });
            
            if (typeof scrollTo !== 'undefined'){//scrollTo - id элемента
                if ($('#event-'+page+'-'+scrollTo).length){
                    setTimeout(function(){
                        $.mobile.silentScroll( $('#event-'+page+'-'+scrollTo).offset().top -  
                            $('#events-header').height() );
                    },300);
                }
                //Нужно перемотать список к выбранному.
                //$('#events-list').scrollTo( '#event-'+scrollTo );
            }
          }catch(error){
             showError(error+'\n'+data);
          }
        }else showErrorConnection();
    });
}
function createLICalors(calors){
    var color = 'event-normal';
    if (calors>=settings.calorlimit) color = 'event-warning';
    return '<li data-icon="false"><a href="#" class="events '+color+'">'+
        '<p style="text-align: center;">Набрано: <strong>'+numeral(calors).format('0') +
        '</strong> Лимит: <strong>'+ settings.calorlimit+ '</strong></p></a></li>';
}
function showCalorsDetail(el){
    //Надо найти все предшествующие li
    var lis = el.closest('ul').children('li');
    //Знаем наверняка, что массив содержит минимум 2 элемента.
    //последний не нужен
    var pr = new MenuProd("",0,0,0,0,0, 50, -1);
    var dt;
    for(var i=0;i<(lis.length-1);i++){
        var page = +$(lis[i]).attr('id').substring(6,7);
        var id = +$(lis[i]).attr('id').substring(8);
        if (events[page][id].type===3){
            pr.addProduct(events[page][id].prod);
            if (typeof dt==='undefined'){
                dt = events[page][id].dt;
            }
        }
    }
    $('#page-calor-detail-date').text( dt.toLocaleDateString('ru-RU') );
    $('#page-calor-info-eaten').text(numeral(pr.getCalor()).format('0'));
    $('#page-calor-info-prot').text(numeral(pr.getProt()).format('0')+' гр.');
    $('#page-calor-info-fat').text(numeral(pr.getFat()).format('0')+' гр.');
    $('#page-calor-info-carb').text(numeral(pr.getCarb()).format('0')+' гр.');
    
    $('#page-calor-info-pcnt-prot').text(
            numeral(100*pr.getCalorByProt()/pr.getCalor()).format('0')+'%');
    $('#page-calor-info-pcnt-fat').text(
            numeral(100*pr.getCalorByFat()/pr.getCalor()).format('0')+'%');
    $('#page-calor-info-pcnt-carb').text(
            numeral(100*pr.getCalorByCarb()/pr.getCalor()).format('0')+'%');
    
    $.mobile.changePage( "#page-calor-detail", { 
        transition: "flip"
    } );
}
function showMenuPage(id,page){
    var event = events[page][id];
    $('#page-menu-info').jqmData('id',id);
    $('#page-menu-info').jqmData('page',page);
    
    $('#page-menu-info-remark').html( '<span id="page-menu-info-datetime">'+
            getTimeString(event.dt)+'<br>'+
            event.dt.toLocaleDateString('ru-RU')+'</span>'+ event.rem );
    var s = new Sugar(event.coefs.sh1);
    $('#s1').text(numeral(s.getView(settings.whole,settings.mmol)).format(settings.mmol?'0.0':'0'));
    s = new Sugar(event.coefs.sh2);
    $('#s2').text(numeral(s.getView(settings.whole,settings.mmol)).format(settings.mmol?'0.0':'0'));
    s = new Sugar(event.coefs.k3);
    $('#k3').text(numeral(s.getView(settings.whole,settings.mmol)).format(settings.mmol?'0.0':'0'));
    $('#k1').text(numeral(event.coefs.getK1()).format('0.00'));
    $('#k2').text(numeral(event.coefs.k2).format('0.00'));
    $('#be').text(numeral(event.coefs.be).format('0.00'));
    
    var d = event.dose;
    $('#dose-quick').text( numeral(d.getDPS()+d.getQCarbD() ).format('0.0') );
    $('#dose-slow').text( numeral(d.getSlCarbD()+d.getProtFatD() ).format('0.0') );
    $('#dose-whole').text( numeral(d.getWholeD()).format('0.0') );
    $('#dose-dps').text( numeral(d.getDPS()).format('0.0') );
    $('#dose-kd').text( numeral(d.getWholeD()-d.getDPS()).format('0.0') );
    
    var p = event.prod;
    $('#page-menu-prot').text( numeral(p.getProt()).format('0.0') );
    $('#page-menu-fat').text( numeral(p.getFat()).format('0.0') );
    $('#page-menu-carb').text( numeral(p.getCarb()).format('0.0') );
    $('#page-menu-gi').text( numeral(p.gi).format('0') );
    $('#page-menu-calor').text( numeral(p.getCalor()).format('0') );
    $('#page-menu-be-amount').text( numeral(p.getCarb()/event.coefs.be).format('0.0') );
    
    $('#page-menu-list').empty();
    if (typeof cached_menus[id]==='undefined'){
        $.post("online.php?"+getSID(),
        {
            action: 'get menufromdiary',
            id : id
        },
        function(data, status){
            if (status === "success"){
                cached_menus[id] = data;
                fillMenuList(cached_menus[id]);
            }else{
                showErrorConnection();
            }
        });
    }else{//Есть в кэше
        fillMenuList(cached_menus[id]);
    }
}

function fillMenuList(menu){
    var l = $('#page-menu-list');
    try{
        var list = JSON.parse(menu);
        for(var i=0;i<list.length;i++){
            l.append( "<li>"+list[i].name+
                    "<span class=\"ui-li-count\">"+numeral(+list[i].weight).format('0')+
                    " гр.</span></li>");
        }
        $.mobile.changePage( "#page-menu-info", { 
            transition: "flip"
        } );
    }catch(error){
        showError(error);
    }
}
function showNewRemarkPage(){
    $('#page-remark-sugar-info').jqmData('id',-1);
    $('#page-RS-header').text('Новое примечание');
    var dt = new Date();
    $('#page-RS-date').val(getDateString(dt));
    $('#page-RS-time').val(getTimeString(dt));
    $('#page-RS-sugar-filed').hide();
    $('#page-RS-remark').val("");
    
    setTimeout(function(){
        $('#page-RS-delete').closest('.ui-btn').hide();
        $('#events-new-menu').collapsible( "collapse" );
    },0);
    $.mobile.changePage( "#page-remark-sugar-info", { 
        transition: "flip"
    } );
}

function showNewSugarPage(){
    $('#page-remark-sugar-info').jqmData('id',-2);
    $('#page-RS-header').text('Новый замер СК');
    var dt = new Date();
    $('#page-RS-date').val(getDateString(dt));
    $('#page-RS-time').val(getTimeString(dt));
    $('#page-RS-sugar-filed').show();
    $('#page-RS-sugar').val(numeral(target.getView(settings.whole,settings.mmol))
            .format(settings.mmol?'0.0':'0'));
    $('#page-RS-remark').val("");
    setTimeout(function(){
        $('#page-RS-delete').closest('.ui-btn').hide();
        $('#events-new-menu').collapsible( "collapse" );
    },0);
    $.mobile.changePage( "#page-remark-sugar-info", { 
        transition: "flip"
    } );
}

function showSugarPage(id,page){
    $('#page-RS-header').text('Замер СК');
    $('#page-RS-date').val(getDateString(events[page][id].dt));
    $('#page-RS-time').val(getTimeString(events[page][id].dt));
    $('#page-RS-sugar-filed').show();
    var s = new Sugar(events[page][id].sh);
    $('#page-RS-sugar').val( numeral(s.getView(settings.whole,settings.mmol)).
            format(settings.mmol?'0.0':'0'));
    $('#page-RS-remark').val(events[page][id].rem);
    $('#page-remark-sugar-info').jqmData('id',id);
    $('#page-remark-sugar-info').jqmData('page',page);
    
    setTimeout(function(){
        $('#page-RS-delete').closest('.ui-btn').show();
    },0);
    
    $.mobile.changePage( "#page-remark-sugar-info", { 
                transition: "flip"
        } );
}
function showRemarkPage(id,page){
    $('#page-RS-header').text('Примечание');
    $('#page-RS-date').val(getDateString(events[page][id].dt));
    $('#page-RS-time').val(getTimeString(events[page][id].dt));
    $('#page-RS-sugar-filed').hide();
    $('#page-RS-remark').val(events[page][id].rem);
    $('#page-remark-sugar-info').jqmData('id',id);
    $('#page-remark-sugar-info').jqmData('page',page);
    setTimeout(function(){
        $('#page-RS-delete').closest('.ui-btn').show();
        
    },0);
    $.mobile.changePage( "#page-remark-sugar-info", { 
            transition: "flip"
        } );
}
function createLIMenu(page,id){
    var event = events[page][id];
    var prod = event.prod;
    var s = new Sugar(event.coefs.sh1);
    var color = compareSugar(s);
    var info ="";
    if (settings.menuinfo & 1) info += 'Б:'+numeral(prod.getProt()).format('0.0')+' ';
    if (settings.menuinfo & 2) info += 'Ж:'+numeral(prod.getFat()).format('0.0')+' ';
    if (settings.menuinfo & 4) info += 'У:'+numeral(prod.getCarb()).format('0.0')+' ';
    if (settings.menuinfo & 8) info += 'ХЕ:'+numeral(prod.getCarb()/event.coefs.be ).format('0.0')+' ';
    if (settings.menuinfo & 32) info += 'ГИ:'+numeral(prod.gi).format('0')+' ';
    if (settings.menuinfo & 64) info += 'ГН'+numeral(prod.getGLIndx()).format('0')+' ';
    if (settings.menuinfo & 128) info += 'Ккал:'+numeral(prod.getCalor()).format('0');

    
    return '<li data-icon="false" id="event-'+page+'-'+id+'"><a href="#" class="events '+color+
    '" id="event-info-'+page+'-'+id+'"><h3>СК '+numeral(s.getView(settings.whole,settings.mmol)).
                format(settings.mmol?'0.0':'0')+
    ' КД '+numeral(event.dose.getWholeD()).format('0.0')+
    (event.dose.getDPS()!==0?' ДПС:'+numeral(event.dose.getDPS()).format('0.0'):'')+
    '</h3><p>'+info+(event.rem.length>0?'&nbsp;&bull;&nbsp;'+event.rem:'')+
    '<span class="ui-li-count event-time-badge">'+
    event.dt.toLocaleTimeString('ru-RU',{hour: '2-digit', minute:'2-digit'})+
    '</span></p></a></li>';
}

function createLISugar(page,id){
    var event = events[page][id];
    var s = new Sugar(event.sh);
    var color = compareSugar(s);
    return '<li data-icon="false" id="event-'+page+'-'+id+'"><a href="#" class="events '+color+'" id="event-info-'+page+'-'+id+'">'+
    '<h3>СК '+numeral(s.getView(settings.whole,settings.mmol)).
                format(settings.mmol?'0.0':'0')+
    '</h3><p>'+event.rem+'<span class="ui-li-count event-time-badge">'+
    event.dt.toLocaleTimeString('ru-RU',{hour: '2-digit', minute:'2-digit'})+
    '</span></p></a></li>';
}

function createLIRemark(page,id){
    var event = events[page][id];
    return '<li data-icon="false" id="event-'+page+'-'+id+'"><a href="#" class="events" id="event-info-'+page+'-'+id+'">'+
             '<p>'+event.rem+'<span class="ui-li-count event-time-badge">'+
             getTimeString(event.dt)+
             '</span></p></a></li>';//<a href="#" class="event-info-btn" id="event-info-'+page+'-'+id+'">Инфо</a></li>';
}
function storeRemark(dt,rem){
    $.post("online.php?"+getSID(),
    {
        action   : 'store remark',
        datetime : dt,
        rem      : rem
    },
    function(data, status){
        if (status === "success"){
            try{
                var id = JSON.parse(data);
                //успех, грузим
                if (Number.isInteger(id)){
                    updateListsAfterInserting(id,new Date(dt));
                }else{
                    showError(data);
                }
            }catch (error){
                showError(error+'\n'+data);
            }
        }else showErrorConnection();
    });
}

function storeSugar(dt,rem,sh){
    $.post("online.php?"+getSID(),
    {
        action   : 'store sugar',
        datetime : dt,
        rem      : rem,
        sh       : sh
    },
    function(data, status){
        if (status === "success"){
            try{
                var id = JSON.parse(data);
                //успех, грузим
                if (Number.isInteger(id)){
                    updateListsAfterInserting(id,new Date(dt));
                }else{
                    showError(data);
                }
            }catch (error){
                showError(error+'\n'+data);
            }
        }else showErrorConnection();
    });
}
function editSugar(id,dt,rem,sh){
    $.post("online.php?"+getSID(),
    {
        action   : 'edit sugar',
        id       : id,
        datetime : dt,
        rem      : rem,
        sh       : sh
    },
    function(data, status){
        if (status === "success"){
            try{
                var res = JSON.parse(data);
                //успех, грузим
                if (Number.isInteger(res) && res===1){
                    updateListsAfterEditing(id,new Date(dt));
                }else{
                    showError(data);
                }
            }catch (error){
                showError(error+'\n'+data);
            }
        }else showErrorConnection();
    });
}

function editRemark(id,dt,rem){
    $.post("online.php?"+getSID(),
    {
        action   : 'edit remark',
        id       : id,
        datetime : dt,
        rem      : rem
    },
    function(data, status){
        if (status === "success"){
            try{
                var res = JSON.parse(data);
                //успех, грузим
                if (Number.isInteger(res)){
                    updateListsAfterEditing(id,new Date(dt));
                }else{
                    showError(data);
                }
            }catch(error){
                showError(error+'\n'+data);
            }
        }else showErrorConnection();
    });
}
function isDateBelongs2Page(dt,page){
    if (!exists(page)){
        return false;
    }
    
    var start = new Date($('#start-date-'+page).val()+' 00:00');
    var end = new Date($('#end-date-'+page).val()+' 00:00');
    end.setDate( end.getDate()+1 );
    
    return dt.getTime()<end.getTime() && dt.getTime()>=start.getTime();
}
function updateListsAfterEditing(id,dt){
    //Обновляем страницу если:
    //1 - id был в странице
    //2 - дата попадает в страницу
    var pages2update = [];
    for(var i=0;i<3;i++){
        if (exists(i)){//Страница есть
            if (typeof events[i][id]!=='undefined' || isDateBelongs2Page(dt,i)){
                pages2update.push(i);
            }
        }
    }
    for(var i=0;i<pages2update.length;i++){
        loadEvents(pages2update[i],id);
    }
}
function updateListsAfterInserting(id,dt){
    //Надо проверить попадает ли дата в интервал какой либо страницы
    for(var i=0;i<3;i++){
        if (exists(i) && isDateBelongs2Page(dt,i)){
            loadEvents(i,id);
        }
    }
}
function exists(page){
    return typeof events[page]!=='undefined';
}
function compareSugar(s){
    if (s.sugar<shlow.sugar){
        return 'event-low';
    }else if(s.sugar>shhigh.sugar && s.sugar<=(shhigh.sugar+5)){
        return 'event-warning';
    }else if(s.sugar>(shhigh.sugar+5)){
        return 'event-danger';
    }
    return 'event-normal';
}