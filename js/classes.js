/*
 * Тут будем описывать необходимые классы
 * */
"use strict";

function Coef(k1,k2,k3,sh1,sh2,be){ 
    this.k1 = +k1;
    this.k2 = +k2;
    this.k3 = +k3;
    this.sh1 = +sh1;
    this.sh2 = +sh2;
    this.be = +be;
    
    this.getK1 = function(){
        return this.k1*this.be/10;
    };
    this.setK1 = function(newk1){//
        if (this.be===0) this.be = 10;
        this.k1 = 10*newk1/this.be;
    };
    this.clone = function(coef){
        this.k1 = coef.k1;
        this.k2 = coef.k2;
        this.k3 = coef.k3;
        this.sh1 = coef.sh1;
        this.sh2 = coef.sh2;
        this.be = coef.be;
    };
}
//Тут не нужен вес, использование ПРОВЕРИТЬ!!!
class Product{
    constructor(id, name, prot, fat, carb, gi){
        this.name = name;
        this.id = +id;
        //this.weight = +weight;
        this.prot = +prot;
        this.fat = +fat;
        this.carb = +carb;
        this.gi = +gi;
    }
}


function MenuProd(name, id, weight, prot, fat, carb, gi, idorig){
    this.name = name;
    this.id = +id;
    this.weight = +weight;
    this.prot = +prot;
    this.fat = +fat;
    this.carb = +carb;
    this.gi = +gi;
    this.idorig = +idorig;
    
    this.getProt = function(){
      return this.prot * this.weight / 100;
    };
    this.getFat = function(){
      return this.fat * this.weight / 100;
    };
    this.getCarb = function(){
      return this.carb * this.weight / 100;
    };
    this.getQCarb = function(){
      return this.carb * this.weight * this.gi / 10000;
    };
    this.getSlCarb = function(){
      return this.getCarb()-this.getQCarb();
    };
    this.getCalor = function(){
        return this.getCalorByFat()+this.getCalorByProt()+this.getCalorByCarb();
    };
    this.getCalorByFat = function(){
        return this.getFat()*9.3;
    };
    this.getCalorByProt = function(){
        return this.getProt()*4.1;
    };
    this.getCalorByCarb = function(){
        return this.getCarb()*4.1;
    };
    this.getGLIndx = function(){//На самом деле гликемическая нагрузка
        return this.carb * this.weight * this.gi /10000;
    };
    this.addProduct = function(pr){
      var allProt = this.getProt() + pr.getProt();
      var allFat = this.getFat() + pr.getFat();
      var allCarb = this.getCarb() + pr.getCarb();
      var allQCarb = this.getQCarb() + pr.getQCarb();
      var newGi;
      if (allCarb>0) newGi = Math.round(100 * allQCarb / allCarb);
      else newGi = 50;
      var newWeight = this.weight + pr.weight;

        if (newWeight!==0){
            if (this.name==="") this.name = pr.name;
            else this.name = this.name + " " + pr.name;
            this.prot = 100 * allProt / newWeight;
            this.fat =  100 * allFat / newWeight;
            this.carb = 100 * allCarb / newWeight;
            this.gi = newGi;
            this.weight = newWeight;
            this.id = -1;
            this.idorig = 0;
        } else{
            this.prot = this.fat = this.carb = 0;
            this.gi = 50;
        }
    };
}

function Dose(prod, coef){
    this.prod = prod;
    this.coef = coef;
    
    this.getDPS = function(){//ДПС
        return (this.coef.sh1-this.coef.sh2)/this.coef.k3;
    };
    this.getQCarbD = function(){
      return this.prod.getQCarb()*this.coef.k1/10;
    };
    this.getSlCarbD = function(){
        return this.prod.getSlCarb()*this.coef.k1/10;
    };
    this.getCarbD = function(){
      return this.prod.getCarb()*this.coef.k1/10;
    };
    this.getProtFatD = function(){
      return this.coef.k2 * this.prod.getProt()*4/100+
              this.coef.k2 * this.prod.getFat()*9/100;
    };
    this.getWholeD = function(){
      return this.getDPS()+this.getCarbD()+this.getProtFatD();
    };
}

function Sugar(sugar,whole,mmol){
    if (typeof whole==='undefined' || typeof mmol==='undefined'){
        this.sugar = sugar;
    }else if (typeof whole!=='undefined' && typeof mmol!=='undefined'){
        this.sugar = sugar/((whole?1:1.12)*(mmol?1:18));
    }
    
    this.getView = function(whole,mmol){
        //Изначально храним СК в ммоль и цельной крови
        return this.sugar*(whole?1:1.12)*(mmol?1:18);
    };
    this.setSugar = function(sh,whole,mmol){
        this.sugar = sh/((whole?1:1.12)*(mmol?1:18));
    };
}