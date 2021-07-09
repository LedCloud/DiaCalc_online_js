<?php
define('IN_DCONLINE', true);
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

include_once 'inc/module.php';
include_once 'inc/functions.php';

$auth = new auth(); //~ Создаем новый объект класса

if (!$auth->check()){
    header("Location: login.php?".htmlspecialchars(SID));
    exit();
}

$user_id = $_SESSION['id_user'];

if (isset($_POST['save'])) {//Нажали кнопку Ок
    $menuinfo = isset($_POST['menu-prot']) +
            isset($_POST['menu-fat'])*2 +
            isset($_POST['menu-carb'])*4 +
            isset($_POST['menu-be'])*8 +
            isset($_POST['menu-dose'])*16 +
            isset($_POST['menu-gi'])*32 +
            isset($_POST['menu-gn'])*64 +
            isset($_POST['menu-calor'])*128;
    
    $whole = $_POST['sh-whole']=='yes'?1:0;
    $mmol = $_POST['sh-mmol']=='yes'?1:0;
    
    $settings = array(
        'menuinfo' => $menuinfo,
        'roundto'  => intval($_POST['menu-round']),
        'whole'  => $whole,
        'mmol'     => $mmol,
        'shtarget' => convertViewToSugar(floatval($_POST['sh-target']),$whole,$mmol),
        'usefreq'  => isset($_POST['prod-freq-use'])?1:0,
        'freqcount'=> intval($_POST['prod-freq-count']),
        'filteroff'=> intval($_POST['prod-filter-off']),
        'calorlimit'=>intval($_POST['calor-limit']),
        'shlow'     => convertViewToSugar(floatval($_POST['sh-low']),$whole,$mmol),
        'shhigh'    => convertViewToSugar(floatval($_POST['sh-high']),$whole,$mmol),
    );
    //Сохраняем в БД$
    $auth->storeSettings($settings,$user_id);
    //А после сохранения в БД 
    //Теперь смотрим, если установлен флаг очистки БД и заполнения ее продуктами по умолчанию
    if (isset($_POST['prod-fill'])){ //prod-fill
        $auth->cleanAndFillBase($user_id);
    }
    
    header("Location: index.php?".htmlspecialchars(SID));
    exit();
}else{
    //Пробуем загрузить настройки
    $settings = $auth->getSettings($user_id);
    $settings['shtarget'] = convertSugarToView($settings['shtarget'], 
            $settings['whole'], $settings['mmol']);
    $settings['shlow'] = convertSugarToView($settings['shlow'], 
            $settings['whole'], $settings['mmol']);
    $settings['shhigh'] = convertSugarToView($settings['shhigh'], 
            $settings['whole'], $settings['mmol']);
}

//echo $settings['shtarget'];

require_once( 'libs/Smarty.class.php');

$smarty = new Smarty();
$smarty->assign('settings',$settings);
$smarty->assign('sid',htmlspecialchars(SID));

if ($auth->useMobile()){
    $smarty->display('settings.tpl');
}else{
    $smarty->display('settings_d.tpl');
}
