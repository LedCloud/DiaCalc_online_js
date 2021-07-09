/* global numeral, settings */

"use strict";


$(document).ready(function(){
    $('input').on({
        focus: function(){
            $(this).select();
        }
    });
    $('.group1').on({
       change: function(){
           fillGroup1( $(this) );
       }
    });
    $('.group2').on({
       change: function(){
           fillInfluenceTables();
       }
    });
    $('.group3').on({
       change: function(){
            calculateCalories();
       }
    });
    $('.glyc-radio').on({
       change: function(){
           bloodMeasureChanged($(this));
       }
    });
   
    $('.control-bmi').on({
       change: function(){
           calcBMI();
       }
    });
    $('#activity-range').on({
       change: function(){
           activityChanged(+$(this).val());
       }
    });
   
    fillInfluenceTables();
    calcBMI();
});
function checkAllFieldsFilled(){
    return  $('#target-weight').val().length!==0 && !isNaN(+$('#target-weight').val()) &&
            $('#age').val().length!==0 && !isNaN(+$('#age').val()) &&
            $('#height').val().length!==0 && !isNaN(+$('#height').val()) &&
            $('#weight').val().length!==0 && !isNaN(+$('#weight').val()) &&
            ($('#male').prop('checked') || $('#female').prop('checked'));
}
function calculateCalories(){
    if (!checkAllFieldsFilled()){
        $('#calories-result').hide();
        $('#not-filled').show();
        return;
    }
    $('#calories-result').show();
    $('#not-filled').hide();   

    var w = +$('#weight').val();
    var h = +$('#height').val();
    var t_w = +$('#target-weight').val();
    var age = +$('#age').val();
    var male = $('#male').prop('checked');
    var activity = +$('#activity-range').val();
    
    var calor_current = calcCalorsNeeded(w,h,age,male,activity);
    var calor_target = calcCalorsNeeded(t_w,h,age,male,activity);
    
    //тут ищем минимальное количество месяцев необходимое для
    //коррекции веса.
    if (calor_target<=1200){
        calor_target = 1201;
    }

    var calor2loose = getCalor2Loose(w,t_w);
    if (calor2loose>0){//сбрасываем вес
        //if (calorneed===1200) calorneed += 1;
        var months = Math.ceil(calor2loose/( (calor_target - 1200)*30 ));
    }
    else{//набираем вес
        var addon = 0;
        if (calor_target<5500){
           addon = 5500 - calor_target;
           months = Math.ceil(-calor2loose/(addon*30));
        }
        else{
           months = 0;
        }
    }
    var term = $('#term');
    var current_op = +term.val();
    
    $('#term option').remove();
    
    console.log('here1 '+months);
    
    if (months>24 && months!==0){
        term.append('<option>'+months+'</option>');
    }else if (months>0){
        let s = '';
        for (let i=months;i<25;i++){
            s += '<option>'+i+'</option>';
        }
        term.append(s);
        if (current_op<months || current_op>24){//Ищем ближайший
            if (current_op<months) current_op = months;
            else current_op = 24;
        }
        term.val(current_op);
    }
    //Теперь можно произвести расчет калорийности для снижения.
    var cal2achive_target = calor_target - calor2loose/(current_op*30);
    
    $('#calories-current-w').text(numeral(calor_current).format('0'));
    $('#calories-target-w').text(numeral(calor_target).format('0'));
    if (months>0){
        $('#calories-correction-w').text(numeral(cal2achive_target).format('0'));
    }else{
        $('#calories-correction-w').text('===');
    }
}
function activityChanged(val){
    var steps = 5000+2000*(val-110)/5;
    if (val===110){
        var descr = 'Сидячая';
        steps = '<'+steps;
    }else if (val===115){
        descr = 'Лёгкая';
        steps = '≈'+steps;
    }else if(val<140){
        descr = 'Средняя';
        steps = '≈'+steps;
    }else if(val<165){
        descr = 'Высокая';
        steps = '≈'+steps;
    }else{
        descr = 'Экстремальная';
        steps = '≈'+steps;
    }
    $('#activity-descr').text(descr);
    $('#activity-steps').text(steps);
}
function calcBMI(){
    var w = +$('#weight').val();
    var h = +$('#height').val();
    if (w===0 || h===0){
        $('#bmi').text('---');
        return;
    }
    h /= 100;
    var bmi = w/(h*h);
    $('#bmi').text( numeral(bmi).format('0.0'));
    if (bmi>25){
        var t = 25*(h*h);
        var mes = 'До верхней границы надо снизить <strong>'+numeral(w-t).format('0')+'</strong> кг.';
        $('#target-weight').val(numeral(t).format('0'));
    }else if (bmi<18.5){
        t = 18.5*(h*h);
        mes = 'До нижней границы надо набрать <strong>'+numeral(t-w).format('0')+'</strong> кг.';
        $('#target-weight').val(numeral(t).format('0'));
    }else{
        mes = '<strong>Ваш вес в порядке!</strong>';
        $('#target-weight').val(numeral(w).format('0'));
    }
    $('#bmi-message').html(mes);
}

function bloodMeasureChanged(el){
    var ouv_view = +$('#glyc-ouv').val();
    
    var mmol = $('#glyc-radio-mmol').prop('checked');
    var whole = $('#glyc-radio-whole').prop('checked');
    
    switch (el.attr('id')){
        case 'glyc-radio-mmol': //Текущее значение 
            var ouv = new Sugar(ouv_view,whole,false);
            break;
        case 'glyc-radio-mgdl':
            ouv = new Sugar(ouv_view,whole,true);
            break;
        case 'glyc-radio-whole':
            ouv = new Sugar(ouv_view,false,mmol);
            break;
        case 'glyc-radio-plasma':
            ouv = new Sugar(ouv_view,true,mmol);
            break;
    }
    $('#glyc-ouv').val( numeral(ouv.getView(whole,mmol)).format(mmol?'0.0':'0'));
    
    var st = '';
    if (mmol){
        $('#glyc-ouv').attr('step','0.01');
        st = 'ммоль/л';
    }else{
        $('#glyc-ouv').attr('step','1');
        st = 'мг/дл';
    }
    st += '<br>';
    if (whole){
        st += 'цельная';
    }else{
        st += 'плазма';
    }
    $('.name-insulin').html(st);
    
    fillInfluenceTables();
}
function fillInfluenceTables(){
    var mmol = $('#glyc-radio-mmol').prop('checked');
    var whole = $('#glyc-radio-whole').prop('checked');
    
    var ouv = new Sugar(+$('#glyc-ouv').val(),whole,mmol);
    
    var s = new Sugar(ouv.sugar/10);
    $('#glyc-ins-01').text( numeral(s.getView(whole,mmol)).format(mmol?'0.00':'0') );
    s = new Sugar(ouv.sugar/5);
    $('#glyc-ins-02').text( numeral(s.getView(whole,mmol)).format(mmol?'0.00':'0') );
    s = new Sugar(ouv.sugar/4);
    $('#glyc-ins-025').text( numeral(s.getView(whole,mmol)).format(mmol?'0.00':'0') );
    s = new Sugar(ouv.sugar/2);
    $('#glyc-ins-05').text( numeral(s.getView(whole,mmol)).format(mmol?'0.00':'0') );
    /*  вес * ЦЕИ * к1 / ХЕ */ 
    var k1 = +$('#glyc-k1').val();
    s = new Sugar( ouv.sugar * k1 / settings.be );
    $('#glyc-carb-1').text( numeral(s.getView(whole,mmol)).format(mmol?'0.00':'0') );
    s = new Sugar( 2*ouv.sugar * k1 / settings.be );
    $('#glyc-carb-2').text( numeral(s.getView(whole,mmol)).format(mmol?'0.00':'0') );
    s = new Sugar( 5*ouv.sugar * k1 / settings.be );
    $('#glyc-carb-5').text( numeral(s.getView(whole,mmol)).format(mmol?'0.00':'0') );
    s = new Sugar( 10*ouv.sugar * k1 / settings.be );
    $('#glyc-carb-10').text( numeral(s.getView(whole,mmol)).format(mmol?'0.00':'0') );
}

function fillGroup1(el){
//Plasma Glucose = (1.59 * HbA1c) - 2.59
    var id = el.attr('id');
    var s = 5.6;
    switch (id){
        case 'wholemmol' : s = +el.val(); break;
        case 'plasmammol': s = +el.val()/1.12; break;
        case 'wholemgdl' : s = +el.val()/18; break;
        case 'plasmamgdl': s = +el.val()/20.16; break;
        case 'hba1c'     : s = (+el.val()*1.59 - 2.59)/1.12; break;
    }
    if (id!=='wholemmol'){
        $('#wholemmol').val(numeral(s).format('0.0'));
    }
    if (id!=='plasmammol'){
        $('#plasmammol').val(numeral(s*1.12).format('0.0'));
    }
    if (id!=='wholemgdl'){
        $('#wholemgdl').val(numeral(s*18).format('0'));
    }
    if (id!=='plasmamgdl'){
        $('#plasmamgdl').val(numeral(s*20.16).format('0'));
    }
    if (id!=='hba1c'){
        $('#hba1c').val(numeral((s*1.12+2.59)/1.59).format('0.0'));
    }
}
function calcCalorsNeeded(weight,height,age,male,activity){
    if (male){
        var s = 5;
    }else{
        s = -161;
    }
    var basal = 9.99 * weight + 6.25 * height - 4.92 * age + s;
    return basal * activity / 100;
}


function getCalor2Loose(weight,w_target){
    var weightchange = weight - w_target;
    /*
     * const CALOR_DOWN = 7716;
     * const CALOR_UP = CALOR_DOWN/0.7;
    */
    if (weightchange>=0){
        return weightchange * 7716;
    }//else
    return weightchange * 11023;
}