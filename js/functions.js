/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
 
"use strict";

function showError(message){
    //нужно найти попап
    //Временно используем простой алерт
    alert(message);
}
function showErrorConnection(){
    alert("Произошла ошибка загрузки данных\nПопробуйте снова!");
}
/**
 * 
 * @param {type} str - string to parse
 * @returns {replaceComma.s|Number} - returns number. Zero if parsing failed
 */
function replaceComma(str){//return float
    if (str.length===0) return 0;
    var s = parseFloat(str.replace(",","."));
    
    if (isNaN(s)) return 0;
    else return s;
}

var params = window
    .location
    .search
    .replace('?','')
    .split('&')
    .reduce(
        function(p,e){
            var a = e.split('=');
            p[ decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
            return p;
        },
        {}
    );

function getSID(){
    return 'dcsid='+params['dcsid'];
}

function getTimeString(date){
    var r = '';
    var h = +date.getHours();
    if (h<10){
        r += '0'+h;
    }else{
        r += h;
    }
    var m = +date.getMinutes();
    if (m<10){
        r += ':0'+m;
    }else{
        r += ':'+m;
    }
    return r;
}

function getDateString(date){
    var r = date.getFullYear() + '-';
    var m = +date.getMonth() + 1;
    if (m<10){
        r += '0'+m;
    }else{
        r += m;
    }
    var d = +date.getDate();
    if (d<10){
        r += '-0'+d;
    }else{
        r += '-'+d;
    }
    return r;
}

function getDateStringLocale(date){
    var r = "";//date.getFullYear() + '-';
    var d = +date.getDate();
    if (d<10){
        r += '0'+d;
    }else{
        r += d;
    }
    var m = +date.getMonth() + 1;
    if (m<10){
        r += '.0'+m;
    }else{
        r += '.'+m;
    }
    r += '.'+date.getFullYear();
    return r;
}
function calculateString(str){
    if (str.length===0) return 0;
    //var reg = /(\d+(\.|,)?\d+)((\+|-){1}\d+(\.|,)?\d+)?/;
    var reg = /(\d+\.?\d?)([\+-]{1}\d+\.?\d?)?/;
    var st = str.replace(/,/g,'.');
    if (!reg.test(st)){
        return 0;
    }
    var gr = reg.exec(st);
    if (typeof gr[2]==='undefined'){
        return +gr[1];
    }
    //Вычисляем
    var res = +gr[1] + +gr[2];
    if (res<0) res = 0;
    return res;
}