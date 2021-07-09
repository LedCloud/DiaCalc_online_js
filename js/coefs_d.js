
/* global numeral, settings */

"use strict";

$(document).ready(function(){
    loadCoefs();
    $('#chk-timed-coefs').change(function(){
        $.post("online.php"+getSID(),
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
                 //считаем к3 на сервере
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
    
    $('#btn-delete').click(function(){
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
                        showError('Ошибка\n'+data);
                    }
                }catch(error){
                    showError(error+'\n'+data);
                }
            }else showErrorConnection();
        });
    });
    
    $('#btn-edit').click(function(){
        //Ищем выбранный чек бокс
        var ch = $("#coefs-table-body").find('input:checked');
        if (typeof ch.attr('id') === "undefined") return;
        
        var id = ch.attr('id' ).substring(10);
        var row = $('#cf-row-'+id);
        var time = row.find('label').text().trim();
        var k1 = row.find('.k1').text();
        var k2 = row.find('.k2').text();
        var k3 = row.find('.k3').text();
        //Заполняем диалог
        $('#coefs-dialog-time').val(time);
        $('#coefs-dialog-k1').val(k1);
        $('#coefs-dialog-k2').val(k2);
        $('#coefs-dialog-k3').val(k3);
        $('#dlg-coef-header').text('Изменить коэффициенты');
        $('#dlg-add-coefs-ok').text('Изменить');
        $('#dlg-add-coefs').data('type','E');
        $('#dlg-add-coefs').modal();
    });
    $('#btn-add').click(function(){
        $('#coefs-dialog-time').val("");
        $('#coefs-dialog-k1').val("");
        $('#coefs-dialog-k2').val("");
        $('#coefs-dialog-k3').val("");
        $('#dlg-coef-header').text('Добавить коэффициенты');
        $('#dlg-add-coefs-ok').text('Добавить');
        $('#dlg-add-coefs').data('type','A');
        $('#dlg-add-coefs').modal();
    });
    $('#dlg-add-coefs-ok').click(function(){
        //Сохраняем коэф-ты
        var time = $('#coefs-dialog-time').val();
        var k1 = replaceComma($('#coefs-dialog-k1').val());
        var k2 = replaceComma($('#coefs-dialog-k2').val());
        var k3 = replaceComma($('#coefs-dialog-k3').val());
        var id = -1;
        //time might be empty
        
        if (!time){
            alert('Не указано время!');
            return;
        }
        $('#dlg-add-coefs').modal('hide');
        
        if ($('#dlg-add-coefs').data('type')==='E'){
            //Меняем, надо вытащить id
            //Должен быть отмечен, иначе редактирование бы не началось
            id = +$("#coefs-table-body").find('input:checked')
                    .attr('id' ).substring(10);
        }
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
                        showError("Ошибка\n"+data);
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
                    st += "<tr id=\"cf-row-"+cs[i].id+"\"><td><label class=\"checkbox-inline\">"+
                    "<input type=\"checkbox\" id=\"coefs-chk-"+cs[i].id+"\"> "+
                    cs[i].time+"</label></td>"+
                    "<td class=\"k1\">"+numeral(cs[i].k1).format('0.00')+"</td>"+
                    "<td class=\"k2\">"+numeral(cs[i].k2).format('0.00')+"</td>"+
                    "<td class=\"k3\">"+
                    numeral(new Sugar(cs[i].k3).getView(settings.whole,settings.mmol)).format(settings.mmol?'0.0':'0')+
                    "</td></tr>";
            //$("#k3").val(numeral(new Sugar(coefs.k3).getView(settings.whole,settings.mmol)).format(settings.mmol?'0.0':'0'));

                }
                $('#coefs-table-body').html( st );
            }catch(error){
                showError(error+'\n'+data);
            }
        }else showErrorConnection();
    });
}