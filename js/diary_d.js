/* global settings, numeral, target, shlow, shhigh */

"use strict";

var events = [];
var cached_menus = {};
var cntx;

$(document).ready(function(){
    var today = new Date();
    var weekago = new Date();
    weekago.setDate( weekago.getDate() - settings.period);
    
    $('#start-date-0').val( getDateString(weekago) );
    $('#end-date-0').val( getDateString(today) );
    
    //Теперь можно загрузить с сервера данные дневника.
    loadEvents(0);
    
    //создаем контекстное меню
    cntx = new BootstrapMenu('.event', {
        fetchElementData: function($rowElem) {
            //page id
            return {page:+$rowElem.attr('id').substring(6,7),
                   id:+$rowElem.attr('id').substring(8)};
          },
        actionsGroups: [ ['changeEvent','restoreEvent'],
            ['removeEvent'],
            ['createSugar','createRemark']
            ],
        actions: {
            changeEvent: {
                name: 'Изменить событие',
                iconClass: 'fa-edit',
                onClick: function(pid){
                    if (events[pid.page][pid.id].type===2 ||events[pid.page][pid.id].type===1){
                        showRemarkSugarDialog(pid.id,pid.page);
                    }else{
                        showMenuDialog(pid.id,pid.page);
                    }
                }
            },
            restoreEvent:{
                name: 'Восстановить меню',
                iconClass: 'fa-history',
                onClick: function(pid){
                    if (events[pid.page][pid.id].type===3){
                        restoreMenu(pid.id);
                    }
                }
            },
            removeEvent: {
                name: 'Удалить событие',
                iconClass: 'fa-remove',
                onClick: function(pid){
                    deleteEventConfirm(pid.id);
                }
            },
            createSugar:{
                name: 'Добавить замер СК',
                iconClass: 'fa-map-pin',
                onClick: function(){
                    addNewSugar();
                }
            },
            createRemark:{
                name: 'Добавить комментарий',
                iconClass: 'fa-comment',
                onClick: function(){
                    addNewRemark();
                }
            }
        }
    });
    
    $('#add-sh-btn').click(function(){
        addNewSugar();
    });
    
    
    $('#add-remark-btn').click(function(){
        addNewRemark();
    });
    
    $('#event-dlg-delete').click(function(){
        var id = +$('#event-dialog').data('id');
        deleteEventConfirm(id);
    });
    
    $('#event-dlg-okay').click(function(){
        //Вынимаем данные и сохраняем.
        var id = $('#event-dialog').data('id');
        var page = $('#event-dialog').data('page');
        var rem = $('#event-dlg-remark').val();
        var date = $('#event-dlg-date').val();
        var time = $('#event-dlg-time').val();
        var sh = $('#event-dlg-sh');
        if (sh.val().length===0){//Если вдруг удалили значение 
            sh.val(numeral(target.getView(settings.whole,settings.mmol))
                        .format(settings.mmol?'0.0':'0'));
        }
        var s;
        // id = -1 new remark type 1 = remark
        // id = -2 new sugar type 2 = sugar
        if ((id<0 && id===-2) || (id>0 && events[page][id].type===2)) {
            //Тут вытаскиваем СК
            s = new Sugar(5.6);
            s.setSugar(replaceComma(sh.val()),settings.whole, settings.mmol);
            //sh = s.sugar;
        }
        if ((((id<0 && id===-1) || (id>0 && events[page][id].type===1)) && rem.length===0) || 
                date.length===0 || 
                time.length===0){
            alert('Какое-то поле не заполнено!');
            return;
        }
        $('#event-dialog').modal('hide');
            
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
    $('.select-all').on({
        focus: function() { 
            $(this).select(); 
        }
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
    
    $('#menu-dlg-delete').click(function(){
        var id = $('#menu-dialog').data('id');
        if(confirm('Хотите удалить меню из дневника?')){
            deleteEvent( id );
        }
    });
    
    $('#menu-dlg-restore').click(function(){
        var id = $('#menu-dialog').data('id');
        if(confirm('Заполнить меню в рассчете сохраненными данными?')){
            restoreMenu( id );
        }
    });
    
    $('#collapse-all-btn-0').click(function(){
        collapseLists($(this),0);
    });
    $('#collapse-all-btn-1').click(function(){
        collapseLists($(this),1);
    });
    $('#collapse-all-btn-2').click(function(){
        collapseLists($(this),2);
    });
    
    $('#add-page-btn').click(function(){
        if (events.length===3) return;
        if (exists(1)){
            //Первая страница уже видна, но при этом видимых страниц не три
            //показываем третью страницу
            $('.pages').removeClass('col-sm-6');
            $('.pages').addClass('col-sm-4');
            $('#page-2').show();
            //Вытягиваем даты из основной страницы
            $('#start-date-2').val($('#start-date-0').val());
            $('#end-date-2').val($('#end-date-0').val());
            loadEvents(2);
        }else{//Тут возможны варианты:
            //видна страница2 и страница0 - надо показать страницу 1 col-cm-4
            //видна только страница0 - надо покзать страницу 1 col-sm-6
            if (events.length===1){
                $('.pages').removeClass('col-sm-4');
                $('.pages').addClass('col-sm-6');
            }else{
                $('.pages').removeClass('col-sm-6');
            $('.pages').addClass('col-sm-4');
            }
            $('#page-1').show();
            //Вытягиваем даты из основной страницы
            $('#start-date-1').val($('#start-date-0').val());
            $('#end-date-1').val($('#end-date-0').val());

            loadEvents(1);
        }
    });
    
    $('#remove-page-btn-1').click(function(){
        deletePage(1);
    });
    $('#remove-page-btn-2').click(function(){
        deletePage(2);
    });
    changePanelsSize();
});// document ready end
function deletePage(page){
    delete events[page];
    $('#events-list-'+page).empty();
    if (events.length>2){
        var p = 2;
        if (page===2){
            p = 1;
        }
        //Надо изменить разметку
        $('#page-0').removeClass('col-sm-4');
        $('#page-'+p).removeClass('col-sm-4');
        $('#page-0').addClass('col-sm-6');
        $('#page-'+p).addClass('col-sm-6');
    }
    $('#page-'+page).hide();
}
function collapseLists(el,page){
    if (typeof el.data('show')==='undefined' ||
            el.data('show')==='show'){
        el.data('show','hide');
    }else{
        el.data('show','show');
    }
    $('.events-description-'+page).collapse(el.data('show'));
}

function deleteEventConfirm(id){
    if(confirm('Хотите удалить событие')){
        deleteEvent( id );
    }
}
function addNewRemark(){
    $('#event-dialog').data('id',-1);
    $('#event-dialog').data('page',-1);
    $('#event-dlg-header').text('Добавить комментарий');
    var now = new Date();
    $('#event-dlg-date').val( getDateString(now) );
    $('#event-dlg-time').val( getTimeString(now) );
    $('#event-dlg-sh-view').hide();
    $('#event-dlg-remark').val('');
    $('#event-dlg-delete').hide();
    $('#event-dialog').modal();
}
function addNewSugar(){
    $('#event-dialog').data('id',-2);
    $('#event-dialog').data('page',-1);
    $('#event-dlg-header').text('Добавить измерение СК');
    var now = new Date();
    $('#event-dlg-date').val( getDateString(now) );
    $('#event-dlg-time').val( getTimeString(now) );
    $('#event-dlg-sh').val(numeral(target.getView(settings.whole,settings.mmol))
        .format(settings.mmol?'0.0':'0'));
    $('#event-dlg-sh-view').show();
    $('#event-dlg-remark').val('');
    $('#event-dlg-delete').hide();
    $('#event-dialog').modal();
}

$(window).resize(function(){
   changePanelsSize();
});

function changePanelsSize(){
    var viewH = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    var h_busy = $('#navbar').outerHeight() + $('#btns').outerHeight();
    $('.events-list').height(  viewH - h_busy - 45 );
}
function pagesVisibleAr(){
    var r = [1];
    if ($('#page-1').is(":visible")) r.push(2);
    if ($('#page-2').is(":visible")) r.push(3);
    return r;
}
function pagesVisible(){
    var c = 1;
    if ($('#page-1').is(":visible")) c++;
    if ($('#page-2').is(":visible")) c++;
    return c;
}
function restoreMenu(id){
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
                    $('#menu-dialog').modal('hide');
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

function isDateBelongs2Page(dt,page){
    if (!exists(page)){
        return false;
    }
    
    var start = new Date($('#start-date-'+page).val()+' 00:00');
    var end = new Date($('#end-date-'+page).val()+' 00:00');
    end.setDate( end.getDate()+1 );
    
    return dt.getTime()<end.getTime() && dt.getTime()>=start.getTime();
}

function deleteEvent(id){
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
                if (JSON.parse(data)!==1){
                    showError('Ошибка\n'+data);
                }else{
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
                }
            }catch(error){
                showError(error+'\n'+data);
            }
        }
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
            try{//успех, грузим
                if (JSON.parse(data)===1){
                    updateListsAfterEditing(id,new Date(dt));
                }else{
                    showError('Ошибка\n'+data);
                }
            }catch(error){
                showError(data+'\n'+error);
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
            try{//успех, грузим
                if (JSON.parse(data)===1){
                    updateListsAfterEditing(id,new Date(dt));
                }else{
                    showError('Ошибка\n'+data);
                }
            }catch(error){
                showError(error+'\n'+data);
            }
        }else showErrorConnection();
    });
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
                    showError('Ошибка\n'+data);
                }
            }catch(error){
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
                    showError('Ошибка\n'+data);
                }
            }catch(error){
                showError(error+'\n'+data);
            }
        }else showErrorConnection();
    });
}
function updateListsAfterInserting(id,dt){
    //Надо проверить попадает ли дата в интервал какой либо страницы
    for(var i=0;i<3;i++){
        if (exists(i) && isDateBelongs2Page(dt,i)){
            loadEvents(i,id);
        }
    }
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
                var dt = new Date(res[i].dt);
                if (dt.toLocaleDateString('ru-RU')!==dateHeader){
                    //Создаем новый заголовок
                    if (dateHeader!==''){//Создаем не первый раз, надо добавить окончание
                        if (settings.calorlimit>0 && calors>0){
                            st += createLICalors(calors);
                            calors = 0;
                        }
                        st += "</div></div>";
                    }
                    dateHeader = dt.toLocaleDateString('ru-RU');
                    st += "<div class=\"panel-date panel-heading\"><h4 class=\"panel-title\">"+
                    "<a data-toggle=\"collapse\" href=\"#collapse-"+page+'-'+getDateString(dt)+"\">"+
                    dateHeader+"</a></h4></div>"+
                    "<div id=\"collapse-"+page+'-'+getDateString(dt)+
                    "\" class=\"events-description-"+page+" panel-collapse collapse in\">"+
                    "<div class=\"list-group\">";
                }
                switch(res[i].type){
                    case 1: events[page][res[i].id] = {
                                        type :1,
                                        dt   : dt,
                                        rem  : res[i].rem
                            };
                            st += '<a href=\"#\" class=\"list-group-item event\" id="event-'+page+'-'+
                                    res[i].id+'"><strong>'+
                                    dt.toLocaleTimeString('ru-RU',{hour: '2-digit', minute:'2-digit'})+
                                    '</strong> '+res[i].rem + '</a>';
                            break;
                    case 2: events[page][res[i].id] = {
                                        type  :2,
                                        dt    : dt,
                                        rem   : res[i].rem,
                                        sh    : res[i].sh
                            };
                            var s = new Sugar(res[i].sh);
                            var color = compareSugar(s);
                            st += '<a href=\"#\" class=\"list-group-item event '+color+'\" id="event-'+page+'-'+
                                    res[i].id+'"><strong>'+
                                    dt.toLocaleTimeString('ru-RU',{hour: '2-digit', minute:'2-digit'})+
                                    ' СК '+numeral(s.getView(settings.whole,settings.mmol))
                                    .format(settings.mmol?'0.0':'0')+
                                    ' </strong>'+res[i].rem + '</a>';
                            break;
                    case 3: var coefs = new Coef( res[i].k1,res[i].k2,res[i].k3,
                                        res[i].sh1,res[i].sh2,settings.be );
                            var prod  = new MenuProd('', -1, res[i].weight, 
                                res[i].prot, res[i].fat, res[i].carb, res[i].gi,-1);
                            var dose = new Dose(prod,coefs);
                            var dps = dose.getDPS();
                            calors += prod.getCalor();
                            events[page][res[i].id] = {
                                        type  : 3,
                                        dt    : dt,
                                        rem   : res[i].rem,
                                        coefs : coefs,
                                        prod  : prod,
                                        dose  : dose
                            };
                            var s = new Sugar(res[i].sh1);
                            var color = compareSugar(s);
                            var info ="";
                            if (settings.menuinfo & 1) info += createDescription('Б',numeral(prod.getProt()).format('0.0'),'Количество белка в гр.')+' ';
                            if (settings.menuinfo & 2) info += createDescription('Ж',numeral(prod.getFat()).format('0.0'),'Количество жиров в гр.')+' ';
                            if (settings.menuinfo & 4) info += createDescription('У',numeral(prod.getCarb()).format('0.0'),'Количество углеводов в гр.')+' ';
                            if (settings.menuinfo & 8) info += createDescription('ХЕ',numeral(prod.getCarb()/coefs.be ).format('0.0'),'Количество хлебных единиц') +' ';
                            if (settings.menuinfo & 32) info += createDescription('ГИ',numeral(prod.gi).format('0'),'Гликемический индекс')+' ';
                            if (settings.menuinfo & 64) info += createDescripption('ГН',numeral(prod.getGLIndx()).format('0'),'Гликемическая нагрузка')+' ';
                            if (settings.menuinfo & 128) info += createDescription('ККАЛ',numeral(prod.getCalor()).format('0'),'Калорийность');
                            st += '<a href=\"#\" class=\"list-group-item event '+color+'\" id="event-'+page+'-'+
                                    res[i].id+'"><strong>'+
                                    dt.toLocaleTimeString('ru-RU',{hour: '2-digit', minute:'2-digit'})+
                                    ' СК '+numeral(s.getView(settings.whole,settings.mmol))
                                    .format(settings.mmol?'0.0':'0')+
                                    '</strong> '+info+'<br>'+
                                createDescription('КД',numeral(dose.getWholeD()).format('0.0'),'')+
                                (dps!==0?' '+createDescription('ДПС',numeral(dose.getDPS()).format('0.0'),''):'')+
                                (res[i].rem.length!==0?'&nbsp;&bull;&nbsp;'+res[i].rem:'') + '</a>';
                            break;
                }
            }
            if (settings.calorlimit>0 && calors>0){
                st += createLICalors(calors);
            }
            st += "</div></div>";
            list.append(st);
            
            if (typeof scrollTo !== 'undefined' && 
                    typeof events[page][scrollTo]!=='undefined'){
                //Нужно перемотать список к выбранному.
                $('#events-list-'+page).scrollTo( '#event-'+page+'-'+scrollTo );
            }
            $('.event').dblclick(function(){
                //Пробуем получить id
                var id_full = $(this).attr('id');
                if (typeof id_full !== 'undefined'){
                    var id = +id_full.substring(8);
                    var page = +$(this).attr('id').substring(6,7);
                    if (events[page][id].type===1 || events[page][id].type===2){
                        showRemarkSugarDialog(id,page);
                    }else{
                        showMenuDialog(id,page);
                    }
                }else{
                    //Открываем панель деталей по дню
                    showCalorsDetail( $(this) );
                }
                
            });
          }catch(error){
            showError(error+'\n'+data);
          }
        }else showErrorConnection();
    });
}
function createDescription(acr,value,title){
    return '<sub>'+acr+'</sub><strong title="'+title+'">'+value+'</strong>';
}
function showRemarkSugarDialog(id,page){
    $("#event-dialog").data('id',id);
    $("#event-dialog").data('page',page);

    if (events[page][id].type===1){
        $('#event-dlg-header').text('Изменить комментарий');
        $('#event-dlg-sh-view').hide();
    }else if (events[page][id].type===2){
        $('#event-dlg-header').text('Изменить измерение СК');
        var s = new Sugar(events[page][id].sh);
        $('#event-dlg-sh').val(numeral(s.getView(settings.whole,settings.mmol))
            .format(settings.mmol?'0.0':'0'));
        $('#event-dlg-sh-view').show();
    }
    $('#event-dlg-time').val(getTimeString(events[page][id].dt));
    $('#event-dlg-date').val(getDateString(events[page][id].dt));
    $('#event-dlg-remark').val( events[page][id].rem );

    $('#event-dlg-delete').show();

    $('#event-dialog').modal();
}
function showMenuDialog(id,page){
    $('#menu-dialog').data('id',id);
    $('#menu-dlg-datetime').text( events[page][id].dt.toLocaleDateString('ru-RU')+' '+
            getTimeString(events[page][id].dt) );
    $('#menu-dlg-remark').text(events[page][id].rem);
    $('#menu-dlg-k1').text( numeral(events[page][id].coefs.getK1()).format('0.00') );
    $('#menu-dlg-k2').text( numeral(events[page][id].coefs.k2).format('0.00') );
    var s = new Sugar(events[page][id].coefs.k3);
    $('#menu-dlg-k3').text( numeral(s.getView(settings.whole,settings.mmol)).format(settings.mmol?'0.0':'0') );
    s = new Sugar(events[page][id].coefs.sh1);
    $('#menu-dlg-sh1').text( numeral(s.getView(settings.whole,settings.mmol)).format(settings.mmol?'0.0':'0') );
    s = new Sugar(events[page][id].coefs.sh2);
    $('#menu-dlg-sh2').text( numeral(s.getView(settings.whole,settings.mmol)).format(settings.mmol?'0.0':'0') );
    $('#menu-dlg-be').text( numeral(events[page][id].coefs.be).format('0') );
    
    var d = events[page][id].dose;
    $('#menu-dlg-dose-quick').text( numeral(d.getDPS()+d.getQCarbD() ).format('0.0') );
    $('#menu-dlg-dose-slow').text( numeral(d.getSlCarbD()+d.getProtFatD() ).format('0.0') );
    $('#menu-dlg-dose-whole').text( numeral(d.getWholeD()).format('0.0') );
    $('#menu-dlg-dose-dps').text( numeral(d.getDPS()).format('0.0') );
    $('#menu-dlg-dose-kd').text( numeral(d.getWholeD()-d.getDPS()).format('0.0') );
    
    var p = events[page][id].prod;
    $('#menu-dlg-prot').text( numeral(p.getProt()).format('0.0') );
    $('#menu-dlg-fat').text( numeral(p.getFat()).format('0.0') );
    $('#menu-dlg-carb').text( numeral(p.getCarb()).format('0.0') );
    $('#menu-dlg-gi').text( numeral(p.gi).format('0') );
    $('#menu-dlg-calor').text( numeral(p.getCalor()).format('0') );
    $('#menu-dlg-be-amount').text( numeral(p.getCarb()/events[page][id].coefs.be).format('0.0') );
    
    $('#menu-dlg-preview').empty();
    //show spinner
    //Вытаскиваем список
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

function fillMenuList(data){
    var l = $('#menu-dlg-preview');
    try{
        var list = JSON.parse(data);
        for(var i=0;i<list.length;i++){
            l.append( "<li class=\"list-group-item \">"+list[i].name+
                    "<span class=\"badge\">"+numeral(+list[i].weight).format('0')+
                    " гр.</span></li>");
        }
        $('#menu-dialog').modal();
    }catch(error){
        showError(error);
    }
}

function exists(page){
    return typeof events[page]!=='undefined';
}

function createLICalors(calors){
    var color = 'event-normal';
    if (calors>=settings.calorlimit) color = 'event-warning';
    return '<li data-icon="false"><a href="#" class="events '+color+'">'+
        '<p style="text-align: center;">Набрано: <strong>'+numeral(calors).format('0') +
        '</strong> Лимит: <strong>'+ settings.calorlimit+ '</strong></p></a></li>';
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
                    showError('Ошибка\n'+data);
                }
            }catch(error){
                showError(error+'\n'+data);
            }
        }else{
            showErrorConnection();
        }
    });
}
function createLICalors(calors){
    var color = 'event-normal';
    if (calors>=settings.calorlimit) color = 'event-warning';
    return '<a href=\"#\" class=\"list-group-item event '+color+'\" style=\"text-align: center;\">'+
                                    'Набрано: <strong>'+numeral(calors).format('0')+
                                    '</strong> Лимит: <strong>' + settings.calorlimit +
                                    ' </strong></a>';
}                            
function showCalorsDetail(el){
    //Надо найти все предшествующие <a>
    var as = el.parent('div.list-group').children('a');
    //Знаем наверняка, что массив содержит минимум 2 элемента.
    //последний не нужен
    var pr = new MenuProd("",0,0,0,0,0, 50, -1);
    var dt;
    for(var i=0;i<(as.length-1);i++){
        var page = +$(as[i]).attr('id').substring(6,7);
        var id = +$(as[i]).attr('id').substring(8);
        if (events[page][id].type===3){
            pr.addProduct(events[page][id].prod);
            if (typeof dt==='undefined'){
                dt = events[page][id].dt;
            }
        }
    }
    $('#calor-info-dlg-date').text( dt.toLocaleDateString('ru-RU') );
    $('#calor-info-dlg-eaten').text(numeral(pr.getCalor()).format('0'));
    $('#calor-info-dlg-prot').text(numeral(pr.getProt()).format('0')+' гр.');
    $('#calor-info-dlg-fat').text(numeral(pr.getFat()).format('0')+' гр.');
    $('#calor-info-dlg-carb').text(numeral(pr.getCarb()).format('0')+' гр.');
    
    $('#calor-info-dlg-pcnt-prot').text(
            numeral(100*pr.getCalorByProt()/pr.getCalor()).format('0')+'%');
    $('#calor-info-dlg-pcnt-fat').text(
            numeral(100*pr.getCalorByFat()/pr.getCalor()).format('0')+'%');
    $('#calor-info-dlg-pcnt-carb').text(
            numeral(100*pr.getCalorByCarb()/pr.getCalor()).format('0')+'%');
    
    $('#calor-info-dialog').modal();
}