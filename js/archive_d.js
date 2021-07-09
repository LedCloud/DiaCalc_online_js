/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global numeral */

"use strict";

var prodArr = {}; //Глобальный массив с продуктами ключ - id группы


$( function() {
    $( "#base-search" ).autocomplete({
      source: function( request, response ) {
          $.post("online.php?"+getSID(),{
              action: "search archive",
              string: request.term
          },function(data, status){
            if (status === "success"){
                try{
                var obj = JSON.parse(data);
                //В ответе должны быть имена продуктов и их id, id группы.
                /*[{label:'yes',id:'25',id_gr:'234'},
                  {label:'yep',value:'26',id_gr:'234'},
                  {label:'yeah',value:'27',id_gr:'234'}]*/
                response( obj );
                }catch(error){
                    showError(error+'\n'+data);
                }
            }else response(["Connection error"]);
          });
      },
      minLength: 3,
      delay: 500,
      close: function(event,ui){
          $("#base-search").val("");
      },
      select: function( event, ui ) {
            var gr_id = +ui.item.id_gr;
            var pr_id = +ui.item.id;
            $('.group-item').removeClass('active');
            $('#gr'+gr_id).addClass('active');
            $('#groups-list').scrollTo('.group-item.active');
            
            loadSelectedGroup(gr_id,pr_id,function(id){
                $(".prod-item").removeClass("active");
                $("#pr"+id).addClass("active");
                $('#prods-list').scrollTo("#pr"+id);
            });
      }
    });
});

$(document).ready(function(){
    $('#groups-list').children('li').first().addClass('active');
    loadSelectedGroup(+$('.group-item.active').attr('id').substring(2));
    
    $(".group-item").click(function(){
        if ($(this).hasClass('active')){
            return;
        }
        $('.group-item').removeClass('active');
        $(this).addClass('active');
        var gr_id = +$(this).attr('id').substring(2);
        loadSelectedGroup(gr_id);
    });
    
    $('#add-prod-dlg-okay').click(function(){
        //Переносим продукт в базу пользователя
        var prid = +$('.prod-item.active').attr('id').substring(2);
        var grid = +$('#add-prod-dlg-select-group').val();
        copyProductToBase(grid,prid);
        $('#add-prod-dialog').modal('hide');
    });
    
    changeGroupsProdsPaneSize();
});
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
                    $('#message-alert').show();
                    $("#message-alert").delay(1000).addClass("in").fadeOut(1500);
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
    var pr_list = $("#prods-list");
    //pr_list.empty();
    if (prods.length===0){
        pr_list.html('');
    }else{
        var str = "";
        //for (var key in prods){
        for(var i=0;i<prods.length;i++){
            //var prod = prods[key];
            var prod = prods[i];
            str += "<li class=\"list-group-item prod-item\" ondragstart=\"drag(event)\" draggable=\"true\" id=\"pr"+
                    prod.id+"\"><h5 class=\"list-group-item-heading\">"+
                    prod.name +
                    "</h5><p class=\"list-group-item-text\">"+
                    '<strong>'+"Б:"+numeral(prod.prot).format('0.0')+
                    " Ж:"+numeral(prod.fat).format('0.0')+
                    " У:"+numeral(prod.carb).format('0.0')+
                    " ГИ:"+numeral(prod.gi).format('0')+'</strong>'+
                    "</p></li>";
        }
        pr_list.html( str );
        pr_list.scrollTop(0);
    }
    $(".prod-item").dblclick(function(){
        var pr_id = +$(this).attr('id').substring(2);
        addProd2UserBase( pr_id );
        //loadProds(+gr_id );
    });
    $(".prod-item").click(function(){
        if ($(this).hasClass('active')){
            return;
        }
        $('.prod-item').removeClass('active');
        $(this).addClass('active');
    });
}
function addProd2UserBase(prid){
    var grid = +$('.group-item.active').attr('id').substring(2);
    //по id надо найти позицию в массиве
    for(var i=0;i<prodArr[grid].length;i++){
        if (prid===prodArr[grid][i].id){
            break;
        }
    }
    var prod = prodArr[grid][i];
    
    $('#add-prod-dlg-name').text(prod.name);
    $('#add-prod-dlg-prot').text(numeral(prod.prot).format('0.0'));
    $('#add-prod-dlg-fat').text(numeral(prod.fat).format('0.0'));
    $('#add-prod-dlg-carb').text(numeral(prod.carb).format('0.0'));
    $('#add-prod-dlg-gi').text(numeral(prod.gi).format('0'));
    
    $('#add-prod-dialog').modal();
}
$(window).resize(function(){
   changeGroupsProdsPaneSize();
});

function changeGroupsProdsPaneSize(){
    var viewH = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    var h_busy = $('#navbar').outerHeight();
    $('#groups-list').height(  viewH - h_busy - 50 );
    $('#prods-list').height(  viewH - h_busy - $('#navBarSearchForm').outerHeight() - 45 );
}