/* global numeral */

"use strict";

var prodArr = {}; //Глобальный массив с продуктами ключ - id группы

$(document).on("pagecreate","#page_archive",function(){
    loadSelectedGroup( $('#select-arc-group').val() );
    
    $("#select-arc-group").bind( "change", function() {
        var gr_id = $("#select-arc-group").val();
        //Надо очистить фильтр
        $("#filterProduct").val("");
        $("#prlist").empty();
        //Теперь загружаем продукты
        loadSelectedGroup(gr_id);
    });
    
    /// autocomplete start
    $('#search-result').on( "filterablebeforefilter", function ( e, data ) {
        startAutoCompletion( $(this),data);
        
    });
    $('#open-search-pane').on('click',function(){
        //Запускаем таймер и показываем панель
        $('#base-search').val("");
        setTimeout( function() { $( '#searchPane' ).popup ( 'open',
            {
                positionTo: "#product-header"
            }); 
            }, 50 );
    });
    //autocompple end
    $('#popup-pr-cancel').on('tap',function(){
        $(".prod-in-list").removeClass("ui-btn-active");
    });
    $('#popup-pr-ok').on('tap',function(){
        //Закрываем попап, снимаем выделение с активной группы
        //Даем команду на перенос продукта
        var grid = +$('#popup-group-choice').val();
        var prid = +$('.prod-in-list.ui-btn-active').parent('li').attr('id').substr(2);
        $(".prod-in-list").removeClass("ui-btn-active");
        $('#contextProdMenu').popup('close');
        
        copyProductToBase(grid,prid);
    });
    $("#page_archive").on("swipeleft",function(){
        swipeLeftProducts();
    });
    $("#page_archive").on("swiperight",function(){
        swipeRightProducts();
    });
});
function swipeLeftProducts(){
    //Открываем следующую группу
    $.mobile.changePage( "#page_archive", { 
        allowSamePageTransition: true,
        transition: "flip"
    } );
    var select = $('#select-arc-group');
    var current_grid = +select.val();
    //Теперь надо пройтись по селекту и найти позицию текущего
    var options = select.children('option');
    //Теперь идем по массиву и ищем позицию
    for(var i=0;i<options.length;i++){
        if ( +$(options[i]).val()===current_grid ){
            break;
        }
    }
    if (i===(options.length-1)){
        //Последний элемент, значит берем из начала
        var next_grid = +$(options[0]).val();
    }else{
        next_grid = +$(options[i+1]).val();
    }
    //Теперь переключаем селект
    select.val(next_grid);
    select.selectmenu('refresh');
    $("#filterProduct").val("");
    //Загружаем группу
    loadSelectedGroup(next_grid);
}
function swipeRightProducts(){
    //Открываем предыдущую группу
    $.mobile.changePage( "#page_archive", { 
        allowSamePageTransition: true,
        transition: "flip",
        reverse: "true"
    } );
    var select = $('#select-arc-group');
    var current_grid = +select.val();
    //Теперь надо пройтись по селекту и найти позицию текущего
    var options = select.children('option');
    //Теперь идем по массиву и ищем позицию
    for(var i=0;i<options.length;i++){
        if ( +$(options[i]).val()===current_grid ){
            break;
        }
    }
    if (i===0){
        //Первый элемент, значит берем из конца
        var next_grid = +$(options[options.length-1]).val();
    }else{
        next_grid = +$(options[i-1]).val();
    }
    //Теперь переключаем селект
    select.val(next_grid);
    select.selectmenu('refresh');
    $("#filterProduct").val("");
    //Загружаем группу
    loadSelectedGroup(next_grid);
}
function copyProductToBase(grid,prid){
    $.post("online.php?"+getSID(),
    {
        action: 'copy prod from archive', 
        grid: grid,
        prid: prid
    },
    function(data, status){
        if (status === "success"){
            try{
                var r = JSON.parse(data);
                if (r!==1){
                    showError("Продукт не был добавлен\nПопробуйте позже\n"+data);
                }else{
                    setTimeout(function() { 
                        $('#message-alert').popup('open');
                    },50);
                    setTimeout(function() { 
                        $('#message-alert').popup('close');
                    },1500); 
                }
            }catch(error){
                showError(error+'\n'+data);
            }
        }else{
                    showErrorConnection();
        }
    });
}

function loadSelectedGroup(gr_id,arg,callback){
    //Проверяем есть ли группа в массиве prodArr
    if (!(gr_id in prodArr)) {
        $.post("online.php?"+getSID(),
        {
            action: 'get archive prods', 
            grid: gr_id
        },
        function(data, status){
            if (status === "success"){
                try{
                    var obj = JSON.parse(data);
                    var prodLoaded = [];//Ассоцированный массив пустой
                    if (obj!==null){
                        var sz=obj.length;
                        for(var i=0;i<sz;i++){
                            var prod = new Product( obj[i].id, obj[i].name, obj[i].prot, obj[i].fat, obj[i].carb, obj[i].gi);
                            prodLoaded[prodLoaded.length] = prod;
                        }
                        prodArr[gr_id] = prodLoaded;//Закэшировали в массив продукты
                        //Здесь уже есть, вызываем функцию заполнения
                        fillProductList(prodArr[gr_id]);
                        //Теперь нужно вызвать callback
                        if (typeof callback==='function'){
                            callback(arg);
                        }
                    }else{//Пустая группа
                        prodArr[gr_id] = {};
                    }
                }catch(error){
                    showError(error+'\n'+data);
                }
            }else{
                showErrorConnection();
            }
        });
    }else{
        //Продукты есть в кэше, вызываем функцию заполнения
        fillProductList(prodArr[gr_id]);
        //Теперь нужно вызвать callback
        if (typeof callback==='function'){
            callback(arg);
        }
    }
}
function fillProductList(prods){
    var pr_list = $("#prlist");
    pr_list.empty();
    
    for(var i=0;i<prods.length;i++){
        var prod = prods[i];
        var li = $('<li/>', {
            'id'        : "pr"+prod.id
        });
        var a = $('<a/>', {
            'href': '#',
            'class': 'prod-in-list ui-btn' 
        });
        a.append($('<h6/>', {
            'text': prod.name
        }));
        a.append($('<p/>', {
            }).append($('<strong/>',{'text': "Б:"+numeral(prod.prot).format('0.0')+" Ж:"+numeral(prod.fat).format('0.0')+
                        " У:"+numeral(prod.carb).format('0.0')+" ГИ:"+numeral(prod.gi).format('0')})));
        li.append(a); 
        pr_list.append(li);

    }
    pr_list.trigger("create");

    $(".prod-in-list").on( "taphold", function(){
        $(".prod-in-list").removeClass("ui-btn-active");
        $(this).addClass("ui-btn-active"); //активный класс нужен для последующего добавления
        //Надо найти продукт и заполнить диалог
        var grid = +$('#select-arc-group').val();
        //по id надо найти позицию в массиве
        //$('.prod-in-list.ui-btn-active').parent('li').attr('id')
        var prid = +$(this).parent('li').attr('id').substr(2);
        for(var i=0;i<prodArr[grid].length;i++){
            if (prid===prodArr[grid][i].id){
                break;
            }
        }
        var prod = prodArr[grid][i];
        
        $("#ctx-name").text( prod.name );
        $('#ctx-dlg-prot').text(numeral(prod.prot).format('0.0'));
        $('#ctx-dlg-fat').text(numeral(prod.fat).format('0.0'));
        $('#ctx-dlg-carb').text(numeral(prod.carb).format('0.0'));
        $('#ctx-dlg-gi').text(numeral(prod.gi).format('0'));
        
        $( "#contextProdMenu" ).popup("open", {
            positionTo: "#"+$(this).parent("li").attr("id")
        });
    });
}
function startAutoCompletion(el,data){
    var $ul = el,
            $input = $( data.input ),
            value = $input.val(),
            html = "";
        $ul.html( "" );
    if ( value && value.length > 2 ) {
            $ul.html( "<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>" );
            $ul.listview( "refresh" );
            $.post("online.php?"+getSID(),{
      action: "search archive",
      string: value
      },function(data, status){
        if (status === "success"){
            try{
            var obj = JSON.parse(data);
            $.each( obj, function ( i, val ) {
                //val.label, val.id, val.gr_id
                    html += "<li id=\"srch"+val.id +
                    "\" grid=\""+val.id_gr +
                    "\" class=\"search-res-lines\""+
                    ">" + val.label + "</li>";
                });
                $ul.html( html );
                $ul.listview( "refresh" );
                //$ul.trigger( "updatelayout");
            $('.search-res-lines').on('click',function(){
                //Тут закрываем попап, чистим его и переводим результат
                $('#searchPane').popup('close');
                $input.val("");
                
                var pr_id = +$(this).attr("id").substring(4);
                var gr_id = +$(this).attr("grid");
                $ul.html( "" );
                $ul.listview( "refresh" );
                
                //Теперь переходим на новую, возможно старую группу
                var select = $('#select-arc-group');
                //Теперь надо пройтись по селекту и найти позицию текущего
                var options = select.children('option');
                //Теперь идем по массиву и ищем позицию
                for(var i=0;i<options.length;i++){
                    if ( +$(options[i]).val()===gr_id ){
                        break;
                    }
                }
                
                if (+select.val()!==gr_id){//Надо сменить группу
                    select.val(gr_id);
                    select.selectmenu('refresh');
                    $("#filterProduct").val("");
                    //Загружаем группу
                    loadSelectedGroup(gr_id,pr_id,
                        function(id){
                            setTimeout(function(){
                                $.mobile.silentScroll( $('#pr'+id).offset().top -
                                    $('#prodHeader').height() );
                            },50);
                        });
                }else{
                    setTimeout(function(){
                        $.mobile.silentScroll( $('#pr'+pr_id).offset().top -
                            $('#prodHeader').height() );
                    },50);
                }
            });
            }catch(error){
                showError(error+'\n'+data);
            }
        }else showErrorConnection();
      });
    }
}