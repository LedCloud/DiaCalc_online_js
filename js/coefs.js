
/* global settings, numeral */

"use strict";

$(document).on("pagecreate","#coef-page",function(){
   loadCoefs();
   $('#chk-timed-coefs').change(function(){
        $.post("online.php?"+getSID(),
        {
            action  : "set timedcoefs",
            value   : $(this).prop('checked')?1:0
        },
            function(data,status){
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
    });
    var fieldDoings = {
             focus: function(){
                 $(this).select();
             },
             change: function(){
                 $.post("online.php?"+getSID(),
                 {
                    action  : "store factors",
                    weight  : replaceComma($('#user-weight').val()),
                    k3factor: replaceComma($('#k3-factor').val())
                 },
                    function(data,status){
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
            };
    $('#user-weight').on( fieldDoings );
    $('#k3-factor').on( fieldDoings );
   
    $('#btn-calc-k3').click(function(){
        $.post("online.php?"+getSID(),
        {
            action: 'calc ouv'
        },function(data, status){
            if (status === "success"){
                try{
                    if (JSON.parse(data)===1){
                        loadCoefs();
                    }else{
                        showError('Ошибка\n'+data);
                    }
                }catch(error){
                    showError(error+'\n'+data);
                }
            }else showErrorConnection();
        });
    });
   
   $('#coef-add-btn').on('click',function(){
       $('#coefTime').val("");
       $('#coefK1').val("");
       $('#coefK2').val("");
       $('#coefK3').val("");
       $('#popup-coef-ok').text('Добавить');
       
       $('#popupCoefs').jqmData('type','A');
       $('#popupCoefs').popup('open');
   });
   $('#coef-edit-btn').on('click',function(){
       //Ищем выбранный чек бокс
        var ch = $("#coefs-table-body").find('input:checked');
        if (typeof ch.attr('id') === "undefined") return;

        var id = ch.attr('id' ).substring(10);
        var row = $('#cf-row-'+id);
        var time = row.find('.time').text().trim();
        var k1 = row.find('.k1').text();
        var k2 = row.find('.k2').text();
        var k3 = row.find('.k3').text();
        
        //Заполняем диалог
       $('#coefTime').val(time);
       $('#coefK1').val(k1);
       $('#coefK2').val(k2);
       $('#coefK3').val(k3);
       $('#popup-coef-ok').text('Изменить');
       
       $('#popupCoefs').jqmData('type','E');
       $('#popupCoefs').popup('open');
   });
   $('#coef-delete-btn').on('click',function(){
       //Достаем список
        var ch = $("#coefs-table-body").find('input:checked');
        if (typeof ch.attr('id') === "undefined") return;
        var items = [];
        $.each(ch,
            function(){
                items.push( +$(this).attr('id').substring(10) );
            }
        );
        $.post("online.php?"+getSID(),
        {
            action: 'delete coefs',
            ids    : JSON.stringify(items)
        },function(data, status){
            if (status === "success"){
                try{
                    if (JSON.parse(data)===1){
                        loadCoefs();
                    }else{
                        showError('Коэффициенты не были удалены\n'+data);
                    }
                }catch(error){
                    showError(error+'\n'+data);
                }
            }else showErrorConnection();
        });
   });
   $('#popup-coef-ok').on('click',function(){
       //Сохраняем коэф-ты
        var time = $('#coefTime').val();
        var k1 = replaceComma($('#coefK1').val());
        var k2 = replaceComma($('#coefK2').val());
        var k3 = replaceComma($('#coefK3').val());
        var id = -1;
        
        if (!time){
            alert('Не указано время!');
            return;
        }
        if ($('#popupCoefs').jqmData('type')==='E'){
            //Меняем, надо вытащить id
            //Должен быть отмечен, иначе редактирование бы не началось
            id = +$("#coefs-table-body").find('input:checked')
                    .attr('id' ).substring(10);
        }
        //теперь можно закрыть диалог
        $('#popupCoefs').popup('close');
        
        var s = new Sugar(5.6);
        s.setSugar(k3,settings.whole,settings.mmol);
        //Сохраняем на сервер, потом перезагружаем таблицу
        $.post("online.php?"+getSID(),
        {
            action: 'save coefs',
            id    : id,
            time  : time,
            k1    : k1,
            k2    : k2,
            k3    : s.sugar //Нужно преобразовать view в value
        },function(data, status){
            if (status === "success"){
                try{
                    if (JSON.parse(data)===1){
                        loadCoefs();
                    }else{
                        showError('Коэффицинты не были сохранены\n'+data);
                    }
                }catch(error){
                    showError(error+'\n'+data);
                }
            }else showErrorConnection();
        });
   });
});

function loadCoefs(){
    $.post("online.php?"+getSID(),
    {
        action: 'get coefs'
    },
    function(data, status){
        if (status === "success"){
            try{
                var cs = JSON.parse(data); //Массив
                //Заполняем таблицу
                var st ="";
                for(var i=0;i<cs.length;i++){
                    st += "<tr id=\"cf-row-"+cs[i].id+"\"><td>"+
                    "<input type=\"checkbox\" id=\"coefs-chk-"+cs[i].id+
                    "\" data-inline=\"true\" data-iconpos=\"notext\">"+
                    "<b class=\"ui-table-cell-label\">#</b>"+
                    "<span class=\"time\">"+
                    cs[i].time+"</span></td>"+
                    "<td><b class=\"ui-table-cell-label\">#</b>"+
                    "<span class=\"k1\">"+
                    numeral(cs[i].k1).format('0.00')+"</span></td>"+
                    "<td><b class=\"ui-table-cell-label\">#</b>"+
                    "<span class=\"k2\">"+
                    numeral(cs[i].k2).format('0.00')+"</span></td>"+
                    "<td><b class=\"ui-table-cell-label\">#</b>"+
                    "<span class=\"k3\">"+
                    numeral(new Sugar(cs[i].k3).getView(settings.whole,settings.mmol)).format(settings.mmol?'0.0':'0')+
                    "</span></td></tr>";
                }
                $('#coefs-table-body').html( st );
            }catch(error){
                showError(error+'\n'+data);
            }
        }else showErrorConnection();
    });
}