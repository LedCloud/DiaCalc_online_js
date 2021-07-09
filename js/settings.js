/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* global numeral */

"use strict";

var sugar = new Sugar(5.6);
var shs;
var mmol,whole;

$(document).on("pageshow","#page_settings",function(){
    whole = $('#sh-whole-1').prop("checked");
    mmol = $('#sh-mmol-mmol').prop("checked");
    shs = [$('#sh-target'),$('#sh-low'),$('#sh-high')];
    for(var i=0;i<shs.length;i++){
        sugar.setSugar(replaceComma(shs[i].val()),whole,mmol);
        shs[i].val(numeral(sugar.getView(whole,mmol)).format(mmol?'0.0':'0'));
    }
});

$(document).on("pagecreate","#page_settings",function(){
    $('.set-field').on({
        focus: function() { 
            $(this).select(); 
        }
    });
    $('.sh-field').on({
        blur: function() { 
            sugar.setSugar(replaceComma($(this).val()),whole,mmol);
            $(this).val(numeral(sugar.getView(whole,mmol)).format(mmol?'0.0':'0')); 
        }
    });
    $('.sh-selector').change(function(){
        //Новые значения
        var whole_new = $('#sh-whole-1').prop("checked");
        var mmol_new = $('#sh-mmol-mmol').prop("checked");
        for(var i=0;i<shs.length;i++){
            //Надо установить на основе старых значений
            sugar.setSugar(replaceComma(shs[i].val()),whole,mmol);
            shs[i].val(numeral(sugar.getView(whole_new,mmol_new)).format(mmol_new?'0.0':'0'));
        }
        whole = whole_new;
        mmol = mmol_new;
    });
    
    $('#prod-fill').change(function(){
       if ($(this).prop("checked")){
           $('#popupFill').popup('open');
       }
    });
    $('#cancel-fill').on( 'click',function(){
        $('#prod-fill').prop( "checked", false ).checkboxradio("refresh");
    });
});

