
"use strict";

$(document).on("pagecreate","#gr-page-mgr",function(){
    $('.gr-in-list').on('click',function(){
        $('.gr-in-list').removeClass("ui-btn-active");
        $(this).addClass("ui-btn-active");
    });
    $("#gr-del-btn").on("click",function(){
        //сначала надо проверить есть ли активная строка
        if ($("#gr-list-mgr li a").hasClass("ui-btn-active")){
            //Заполняем диалог
            var line = $(".gr-in-list.ui-btn-active");
            var number = line.children('span').text();
            //Проверка на пустую строку Строка не будет пустой, т.к. там будет хотя бы цифра
            $("#gr-name").text(line.text().substring(0,line.text().length-number.length));//Название
            //Количество
            $("#gr-products").text(number);
            //$("#gr-id").text($(this).parent('li').attr('id'));
            $( "#delDialog" ).popup( "open" );
        }
    });
    $( "#gr-up-btn" ).bind( "click", function() {
        //Проверяем есть ли выбор
        if ($("#gr-list-mgr li a").hasClass("ui-btn-active")){
            //Теперь проверяем не первый ли это элемент
            if (!$("#gr-list-mgr li:first-child a").hasClass("ui-btn-active") ){
                //Меняем местами
                var li_active = $(".gr-in-list.ui-btn-active").parent("li");
                var lower = li_active.attr("id").substring(2);
                var upper = li_active.prev().attr("id").substring(2);
                $.post("online.php?"+getSID(),
                {
                    action: 'swap groups', 
                    lower: lower,
                    upper: upper
                },
                function(data, status){
                    if (status === "success"){
                        try{
                            if (JSON.parse(data)===1){
                                //Теперь двигаем группы
                                li_active.prev('li').before(li_active);
                            }else{
                                showError('Ошибка\n'+data);
                            }
                        }catch(error){
                            showError(error+'\n'+data);
                        }
                    }else showErrorConnection();
                });
            }
        }
    });
    $( "#gr-down-btn" ).bind( "click", function() {
        //Проверяем есть ли выбор
        if ($("#gr-list-mgr li a").hasClass("ui-btn-active")){
            //Теперь проверяем не последний ли это элемент
            if (!$("#gr-list-mgr li:last-child a").hasClass("ui-btn-active") ){
                //Меняем местами
                var li_active = $(".gr-in-list.ui-btn-active").parent("li");
                var upper = li_active.attr("id").substring(2);
                var lower = li_active.next().attr("id").substring(2);
                $.post("online.php?"+getSID(),
                {
                    action: 'swap groups', 
                    lower: lower,
                    upper: upper
                },
                function(data, status){
                    if (status === "success"){
                        try{
                            if (JSON.parse(data)===1){
                                //Теперь двигаем группы
                                li_active.next('li').after(li_active);
                            }else{
                                showError('Ошибка\n'+data);
                            }
                        }catch(error){
                            showError(error+'\n'+data);
                        }
                    }else showErrorConnection();
                });
            }
        }
    });
    $("#gr-edit-btn").on("click",function(){
        //сначала надо проверить есть ли активная строка
        if ($("#gr-list-mgr li a").hasClass("ui-btn-active")){
            //Заполняем диалог
            var popup = $( '#groupDialog' );
            if (popup.jqmData('action')!==undefined) popup.jqmRemoveData('action');
            popup.jqmData('action', 'edit');
            popup.find('h3').text("Изменить группу");
            
            var line = $(".gr-in-list.ui-btn-active");
            var number = line.children('span').text();
            $('#groupName').val(line.text().substring(0,line.text().length-number.length).trim());
            
            popup.popup ( 'open' );
        }
    });
    $("#gr-add-btn").on("click",function(){
        //Заполняем диалог
        var popup = $( '#groupDialog' );
        if (popup.jqmData('action')!==undefined) popup.jqmRemoveData('action');
        popup.jqmData('action', 'add');
        popup.find('h3').text("Новая группа");

        $('#groupName').val("");

        popup.popup ( 'open' );
    });
    //Теперь удаляем из базы
    $("#del-gr-ok").on("click",function(){
        //Сначала получаем id группы
        var lirow = $(".gr-in-list.ui-btn-active").parent("li");
        var grid = lirow.attr("id").substring(2);
        
        $.post("online.php?"+getSID(),
        {
            action: 'del group', 
            grid: grid
        },
        function(data, status){
            if (status === "success"){
               //Успешно сделали запрос
               //Теперь получим кол-во удаленных групп, если 1, то все успешно
                try{
                    if (JSON.parse(data)===1){
                       //Теперь надо удалить строку <li>...</li>
                       lirow.remove();
                    }else{
                       showError("Удаление не получилось");
                    }
                }catch(error){
                    showError(error+'\n'+data);
                }
            }else showErrorConnection();
        });
    });
    
    $("#btn-gr-ok").on("click",function(){
        var popup = $( '#groupDialog' );
        if (popup.jqmData('action')==='add'){
            var gr_name = $('#groupName').val();
            if (gr_name){
                $.post("online.php?"+getSID(),
                {
                    action: 'add group', 
                    grname: gr_name
                },
                function(data, status){
                    if (status === "success"){
                      try{  
                        //Нужно получить id группы и добавить ее в список
                        var obj = JSON.parse(data);
                        //<li id="gr238034" sortind="7" class="ui-li-has-count"><a href="#" class="gr-in-list ui-btn ui-btn-icon-none ui-icon-carat-r">Готовые продукты<span class="ui-li-count ui-body-inherit">85</span></a></li>
                        $("#gr-list-mgr").append("<li id=\"gr"+obj+
                                "\" class=\"ui-li-has-count\"><a href=\"#\" class=\"gr-in-list ui-btn ui-btn-icon-none ui-icon-carat-r\">"+
                                gr_name+"<span class=\"ui-li-count ui-body-inherit\">0</span></a></li>");
                        $("#gr-list-mgr").trigger("create");
                        $(".gr-in-list").on("tap",function(){
                            $(".gr-in-list").removeClass("ui-btn-active");
                            $(this).addClass("ui-btn-active");
                        });
                      }catch(error){
                          showError(error+'\n'+data);
                      }
                    }else showErrorConnection();
                });
            }
            else showError("Имя группы не задано");
        }else{
            var gr_new_name = $('#groupName').val();
            if (gr_new_name){
            //Проверяем изменилось ли что то
                var line = $(".gr-in-list.ui-btn-active");
                var number = line.children('span').text();
                //Проверка на пустую строку Строка не будет пустой, т.к. там будет хотя бы цифра
                var oldname = line.text().substring(0,line.text().length-number.length);
                if (gr_new_name!==oldname){
                    var gr_id = $(".gr-in-list.ui-btn-active").parent("li").attr("id").substring(2);
                    //Меняем
                    $.post("online.php?"+getSID(),
                    {
                        action: 'edit group', 
                        grid  : gr_id,
                        grname: gr_new_name
                    },
                    function(data, status){
                        if (status === "success"){
                            try{
                                if (JSON.parse(data)===1){ //<span class="ui-li-count ui-body-inherit">8</span>
                                    $(".gr-in-list.ui-btn-active").text(gr_new_name);
                                    $(".gr-in-list.ui-btn-active")
                                            .append("<span class=\"ui-li-count ui-body-inherit\">"+
                                            number+"</span>");
                                }else{
                                    showError('Ошибка\n'+data);
                                }
                            }catch(error){
                                showError(error+'\n'+data);
                            }
                        }else showErrorConnection();
                    });
                }else{
                    showError("Имя не изменилось");
                }
            }else{
                showError("Имя группы не может быть пустым");
            }
        }
    });
});
