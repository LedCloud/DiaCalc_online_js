<?php
define('IN_DCONLINE', true);
//DEFINE('DEBUG',true);
/* 
 * Это будет сервер для Ajax запросов
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
//Вначале проверяем есть ли пост запрос
if (!$_POST) //
{
    die("NULL");
}
include_once 'inc/module.php';

$auth = new auth();

if (!$auth->check()){
    die("NON AUTH");
}

//Теперь обрабатываем запросы
$action = $_POST['action'];
$user_id = $_SESSION['id_user'];

switch ($action){
    case 'get groups'           : giveGroups(); break;
    case 'del group'            : deleteGroup(); break;
    case 'get menu'             : giveMenu(); break;
    case 'add group'            : addGroup(); break;
    case 'edit group'           : editGroup(); break;
    case 'swap groups'          : swapGroups(); break;
    case 'get prods'            : giveProds(); break;
    case 'get counted gr'       : giveCountedGroups(); break;
    case 'add prod2menu'        : addProd2Menu(); break;
    case 'remove prodFromMenu'  : removeProdFromMenu(); break;
    case 'del prod'             : deleteProd(); break;
    case 'edit prod'            : editProd(); break;
    case 'add prod'             : addProd(); break;
    case 'remove from menu'     : clearMenuFromProd(); break;
    case 'update menu weight'   : updateMenuProdWeight(); break;
    case 'send coefs'           : storeCoefs(); break;
    case 'flush menu'           : flushMenu(); break;
    case 'product group'        : changeGroupOfProduct(); break;
    case 'search'               : search(); break;
    case 'get coefs'            : giveCoefs(); break;
    case 'save coefs'           : saveCoefs(); break;
    case 'delete coefs'         : deleteCoefs(); break;
    case 'store factors'        : storeFactors(); break;
    case 'calc ouv'             : calcOUV(); break;
    case 'set timedcoefs'       : setTimedCoefs(); break;
    case 'store remark'         : storeRemark(); break;
    case 'store sugar'          : storeSugar(); break;
    case 'get diary'            : giveDiary(); break;
    case 'delete event'         : deleteEvent(); break;
    case 'edit remark'          : editRemark(); break;
    case 'edit sugar'           : editSugar(); break;
    case 'store menu2diary'     : storeMenuToDiary(); break;
    case 'get menufromdiary'    : giveMenuFromDiary(); break;
    case 'restore menu'         : restoreMenu(); break;
    case 'store period'         : storePeriod(); break;
    case 'store eaten'          : storeEaten(); break;
    case 'get archive prods'    : giveArchiveProds(); break;
    case 'search archive'       : searchArchive(); break;
    case 'copy prod from archive': copyProdFromArchive(); break;

            default: die("request is incorrect");
}
function copyProdFromArchive(){
    global $base,$user_id;
    $prid = intval($_POST['prid']);
    $togroup = intval($_POST['grid']);
    
    if (!$base->query("INSERT INTO `backup_prods` ".
        "(`iduser`, `idgroup`, `name`, `prot`, `fat`, `carb`, `gi`, `weight`) ".
        "SELECT $user_id, $togroup, `name`,`prot`,`fat`,`carb`,`gi`,100 FROM `arcprods` WHERE id=$prid;")){
        dieDB($base->error);
    }
    echo json_encode(1);
}
function storeEaten(){
    global $base,$user_id;
    $eaten = intval($_POST['eaten']);
    $dt = $base->escape_string($_POST['dt']);
    if (!$base->query("UPDATE `backup_users` SET `eaten`='".$eaten."', `eatendate`='".$dt.
            "' WHERE `id`=$user_id;")){
        dieDB($base->error);
    }
    echo json_encode(1);
}
function storePeriod(){
    global $base,$user_id;
    $period = intval($_POST['period']);
    if (!$base->query("UPDATE `settings` SET `period`='".$period."' WHERE `iduser`=$user_id;")){
        dieDB($base->error);
    }
    echo json_encode(1);
}
function restoreMenu(){
    global $base,$user_id;
    $id = intval($_POST['id']);
    //Чистим backup_menus
    if (!$base->query("DELETE FROM `backup_menus` WHERE `iduser`='".$user_id."';")){
        dieDB($base->error);
    }
       
    //Копируем содержимое меню
    if (!$base->query("INSERT INTO `backup_menus` (`iduser`,`name`,`prot`,`fat`,`carb`,`gi`,`weight`) ".
        "SELECT '".$user_id."',`name`,`prot`,`fat`,`carb`,`gi`,`weight` ".
        "FROM `diaryrecords` ".
        "WHERE `diaryrecords`.`iduser`='".$user_id."' AND `diaryrecords`.`owner`='".$id."';")){
        dieDB($base->error);
    }
    
    //Переносим данные, к1, ЦЕИ и т.п.
    if (!$base->query("UPDATE backup_users AS bu ".
            "LEFT JOIN diary AS di ".
            "ON bu.id = di.iduser ".
            "SET bu.k1=di.k1, ".
            "bu.k2 = di.k2, ".
            "bu.k3 = di.k3, ".
            "bu.sh1 = di.sh1, ".
            "bu.sh2 = di.sh2 ".
            "WHERE di.id='".$id."' AND bu.id='".$user_id."';")){
        dieDB($base->error);
    }
    echo json_encode(1);
}

function giveMenuFromDiary(){
    global $base,$user_id;
    $id = intval($_POST['id']);
    
    if (!$res=$base->query(
            "SELECT `name`,`weight` FROM `diaryrecords` ".
            "WHERE `iduser`='".$user_id."' AND `owner`='".$id."';")){
        dieDB($base->error);
    }
    $menulines = array();
    while ($row=$res->fetch_assoc()){
        $menulines[] = array(
            'name'      => $row['name'],
            'weight'    => $row['weight']
        );
    }
    $res->close();
    echo json_encode($menulines);
}

function storeMenuToDiary(){
    global $base,$user_id;
    $result = json_decode($_POST['result'], $assoc=true);
    $dt = $base->escape_string($_POST['datetime']);
    $remark = $base->escape_string($_POST['remark']);
    
    //Сохраняем итоговый продукт в базу
    if (!$base->query("INSERT INTO `diary` ".
        "(`iduser`,`dt`,`rem`,`type`,`sh1`,`sh2`,`k1`,`k2`,`k3`,`prot`,`fat`,`carb`,`gi`,`weight`) ".
        "SELECT '".$user_id."','".$dt."','".$remark."','3', ".
        "backup_users.sh1, backup_users.sh2, backup_users.k1, backup_users.k2, backup_users.k3, ".
        "'".floatval($result['prot'])."','".floatval($result['fat'])."','".floatval($result['carb'])."','".
        intval($result['gi'])."','".floatval($result['weight'])."' ".
        "FROM backup_users ".
        "WHERE backup_users.id='".$user_id."';")){
        dieDB($base->error);
    }
    
    
    $owner = $base->insert_id;
    //Сохраняем продукты
    if (!$base->query("INSERT INTO `diaryrecords` ".
        "(`iduser`,`owner`,`name`,`prot`,`fat`,`carb`,`gi`,`weight`) ".
        "SELECT '".$user_id."','".$owner."', ".
        "backup_menus.name,backup_menus.prot,backup_menus.fat,backup_menus.carb,backup_menus.gi, backup_menus.weight ".
        "FROM backup_menus ".
        "WHERE backup_menus.iduser='".$user_id."';")){
        dieDB($base->error);
    }
    
    echo json_encode(1);
}

function editSugar(){
    global $base,$user_id;
    $id = intval($_POST['id']);
    $dt = $base->escape_string($_POST['datetime']);
    $rem = $base->escape_string($_POST['rem']);
    $sugar = floatval($_POST['sh']);
    if (!$base->query(
            "UPDATE `diary` SET `dt`='".$dt."', `rem`='".$rem."', `sh1`='".$sugar."' WHERE `id` = '".$id.
            "' AND `iduser` = '".$user_id."';")){
        dieDB($base->error);
    }
    //Формируем ответ
    echo json_encode(1);
}
function editRemark(){
    global $base,$user_id;
    $id = intval($_POST['id']);
    $dt = $base->escape_string($_POST['datetime']);
    $rem = $base->escape_string($_POST['rem']);
    if (!$base->query(
            "UPDATE `diary` SET `dt` = '".$dt."', `rem` = '".$rem."' WHERE `id` = '".$id.
            "' AND `iduser` = '".$user_id."';")){
        dieDB($base->error);
    }
    //Формируем ответ
    echo json_encode(1);
}

function deleteEvent(){
    global $base,$user_id;
    $id = intval($_POST['id']);
    if (!$base->query(
        "DELETE FROM `diary` WHERE `iduser`='".$user_id."' AND `id`='".$id."';")){
        dieDB($base->error);
    }
    if (!$base->query("DELETE FROM `diaryrecords` WHERE `iduser`='".$user_id."' AND `owner`='".$id."';")){
        dieDB($base->error);
    }
    echo json_encode(1);
}
function giveDiary(){
    global $base,$user_id;
    $start = $base->escape_string($_POST['start']);
    $end   = $base->escape_string($_POST['end']);
    if (!$res=$base->query("SELECT `id`,`dt`,`rem`,`type`,`sh1`,`sh2`,`k1`,`k2`,`k3`,`prot`,`fat`,`carb`,`gi`,`weight`".
            " FROM `diary` WHERE `iduser`='".$user_id.
            "' AND `dt`>='".$start."' AND `dt`<DATE_ADD('".$end."', INTERVAL 1 DAY) ORDER BY `dt`;")){
        dieDB($base->error);
    }
    
    $events = array();
    while ($row=$res->fetch_assoc()){
        $type = $row['type'];
        switch ($type){
            case 1: $events[] = array(
                'type'  => 1,
                'id'    => $row['id'],
                'dt'    => $row['dt'],
                'rem'   => $row['rem'],
            );
                break;
            case 2: $events[] = array(
                'type'  => 2,
                'id'    => $row['id'],
                'dt'    => $row['dt'],
                'rem'   => $row['rem'],
                'sh'   => $row['sh1'],
            );
                break;
            case 3: $events[] = array(
                'type'  => 3,
                'id'    => $row['id'],
                'dt'    => $row['dt'],
                'rem'   => $row['rem'],
                'sh1'   => $row['sh1'],
                'sh2'   => $row['sh2'],
                'k1'    => $row['k1'],
                'k2'    => $row['k2'],
                'k3'    => $row['k3'],
                'prot'  => $row['prot'],
                'fat'   => $row['fat'],
                'carb'  => $row['carb'],
                'gi'    => $row['gi'],
                'weight'=> $row['weight']
            );
        }
    }
    $res->close();
    
    echo json_encode($events);
}
function storeSugar(){
    global $base,$user_id;
    $dt = $base->escape_string($_POST['datetime']);
    $rem = $base->escape_string($_POST['rem']);
    $sh = floatval($_POST['sh']);
    
    if (!$base->query(
            "INSERT INTO `diary` (`iduser`, `dt`, `rem`, `type`, `sh1` ) VALUES ('"
            .$user_id."', '".$dt."', '".$rem."', '2', '".$sh."');")){
        dieDB($base->error);
    }
    //Формируем ответ
    $new_id = $base->insert_id;
    echo json_encode($new_id);
}
function storeRemark(){
    global $base,$user_id;
    $dt = $base->escape_string($_POST['datetime']);
    $rem = $base->escape_string($_POST['rem']);
    if (!$base->query(
            "INSERT INTO `diary` (`iduser`, `dt`, `rem`, `type`) VALUES ('"
            .$user_id."', '".$dt."', '".$rem."', 1);")){
        dieDB($base->error);
    }
    //Формируем ответ
    $new_id = $base->insert_id;
    echo json_encode($new_id);
}

function setTimedCoefs(){
    global $base,$user_id;
    $use = intval($_POST['value']);
    //UPDATE `settings` SET `timedcoefs` = '1' WHERE `settings`.`id` = 2 AND `settings`.`iduser` = 1
    if (!$base->query("UPDATE `settings` SET `timedcoefs` = '".$use."' ".
            "WHERE `iduser`='".$user_id."';")){
        dieDB($base->error);
    }
    echo json_encode(1);
}
function calcOUV(){
    global $base,$user_id;
    
    if (!$res=$base->query("SELECT `be` FROM `backup_users` WHERE `id`='".$user_id."';")){
        dieDB($base->error);
    }
    if ($res->num_rows!=1){
        dieDB(' Too many datas');
    }
    $row = $res->fetch_assoc();
    $be = $row['be'];
    $res->close();
    
    if (!$res=$base->query("SELECT `k3factor`,`weight` FROM `settings` WHERE `iduser`='".$user_id."';")){
        dieDB($base->error);
    }
    if ($res->num_rows!=1){
        dieDB('Too many datas');
    }
    $row = $res->fetch_assoc();
    $weight = $row['weight'];
    $k3factor = $row['k3factor'];
    $res->close();
    
    
    if (!$base->query("UPDATE `coefs` SET `k3`=".
            $k3factor."/(".$weight."*`k1`*10/".$be.") WHERE `iduser`='".$user_id."';")){
        dieDB($base->error);
    }
    echo json_encode(1);
}
function storeFactors(){
    global $base,$user_id;
    $k3factor = floatval($_POST['k3factor']);
    $weight = floatval($_POST['weight']);
    
    //UPDATE `settings` SET `k3factor` = '174', `weight` = '88' WHERE `settings`.`id` = 2 AND `settings`.`iduser` = 1
    if (!$base->query("UPDATE `settings` SET `k3factor` = '".$k3factor.
            "', `weight` = '".$weight."' WHERE `iduser` = '".$user_id."';")){
        dieDB($base->error);
    }
    echo json_encode(1);
}

function deleteCoefs(){
    global $base,$user_id;
    
    $items = json_decode($base->escape_string($_POST['ids']), $assoc=true);
    
    if (!$base->query(
        "DELETE FROM `coefs` WHERE `iduser`='".$user_id."' AND `id` IN ('".
        implode("', '", $items)."');"
            )){
        dieDB($base->error);
    }
    echo json_encode(1);
}

function saveCoefs(){//Сохраняем или изменяем коэффициенты
    global $base, $user_id;
    
    $id = intval($_POST['id']);
    $time = $base->escape_string($_POST['time']);
    $k1 = floatval($_POST['k1']);
    $k2 = floatval($_POST['k2']);
    $k3 = floatval($_POST['k3']);
    if ($id==-1){
        if (!$base->query(
                "INSERT INTO `coefs` (`iduser`, `time`, `k1`, `k2`, `k3`) VALUES ('"
                .$user_id.
                "', '".$time."', '".$k1."','".$k2."', '".$k3."');")){
            dieDB($base->error);
        }
    }else{
        if (!$base->query("UPDATE `coefs` SET `time`='".$time."', `k1`='".
                $k1."', `k2`='".$k2."', `k3`='".$k3."' WHERE `id`='".$id.
                "' AND `iduser`='".$user_id."';")){
            dieDB($base->error);
        }
    }
    echo json_encode(1);
}
function giveCoefs(){
    global $base, $user_id;
    
    if (!$res=$base->query("SELECT `id`,`time`,`k1`,`k2`,`k3` FROM `coefs` WHERE `iduser`='".
            $user_id."' ORDER BY `time`;")){
        dieDB($base->error);
    }
    $coefs = array();
    while ($row=$res->fetch_assoc()){
        $coefs[] = array(
            'id'   => $row['id'],
            'time' => $row['time'],
            'k1'   => $row['k1'],
            'k2'   => $row['k2'],
            'k3'   => $row['k3']
        );
    }
    $res->close();
    echo json_encode($coefs);
}
function searchArchive(){
    global $base;
    $searchString = $base->escape_string($_POST['string']);
    if (!$res = $base->query("SELECT `name`,`id`,`idgroup` FROM `arcprods` WHERE `name` LIKE '%".$searchString."%' LIMIT 15;")){
        dieDB($base->error);
    }
    $searchRes = array();
    while ($row=$res->fetch_assoc()){
        $searchRes[] = array(
            'label'   => $row['name'],
            'id'      => (string)$row['id'],
            'id_gr'   => (string)$row['idgroup']
        );
    }
    $res->close();
    echo json_encode($searchRes);
}
function search(){
    global $base,$user_id;
    $searchString = $base->escape_string($_POST['string']);
    //SELECT `name`,`id`,`idgroup` FROM `backup_prods` WHERE `iduser`=1 AND `name` like '%карт%';
    if (!$res = $base->query("SELECT `name`,`id`,`idgroup` FROM `backup_prods` WHERE `iduser`='".$user_id.
            "' AND `name` LIKE '%".$searchString."%' LIMIT 15;")){
        dieDB($base->error);
    }
    $searchRes = array();
    while ($row=$res->fetch_assoc()){
        $searchRes[] = array(
            'label'   => $row['name'],
            'id'      => (string)$row['id'],
            'id_gr'   => (string)$row['idgroup']
        );
    }
    $res->close();
    echo json_encode($searchRes);
}

//Меняем группу продукта
function changeGroupOfProduct(){
    global $base,$user_id;
    $pr_id = $base->escape_string($_POST['prid']);
    $gr_id = $base->escape_string($_POST['grid']);
    
    if (!$base->query("UPDATE `backup_prods` SET `idgroup`='".$gr_id.
            "' WHERE `id` = '".$pr_id."' AND `iduser`='".$user_id."';")){
        dieDB($base->error);
    }
    
    echo json_encode(1);
}

function flushMenu(){
    global $base,$user_id;
    //Сначала получаем целовой СК, потом его заносим в sh,sh2
    if (!$res=$base->query("SELECT `shtarget` FROM settings WHERE `iduser`='".$user_id."';" )){
            dieDB($base->error);
    }
    if ($res->num_rows>0){
       $row = $res->fetch_assoc();
       $target = $row['shtarget'];
       $res->close();
    }
    else{
      $target = 5.6;
    }

    if (!$base->query("UPDATE `backup_users` SET `sh1`='".$target."', `sh2`='".
            $target."' WHERE  `id`='".$user_id."';")){
      dieDB($base->error);
    }
    if (!$base->query("DELETE FROM `backup_menus` WHERE `iduser`='".$user_id."';")){
        dieDB($base->error);
    }
    echo json_encode(1);
}        
function storeCoefs(){
    global $base,$user_id;
    $k1 = floatval($_POST['k1']);
    $k2 = floatval($_POST['k2']);
    $k3 = floatval($_POST['k3']);
    $sh1 = floatval($_POST['sh1']);
    $sh2 = floatval($_POST['sh2']);
    $be = floatval($_POST['be']);
    if (!$base->query("UPDATE `backup_users` SET `k1`='".$k1."', `k2`='".$k2.
            "', `k3`='".$k3."', `sh1`='".$sh1."', `sh2`='".$sh2."', `be`='".
            $be."' WHERE `id` = '".$user_id."';")){
        dieDB($base->error);
    }
    echo json_encode(1);
}        
function updateMenuProdWeight(){
    global $base,$user_id;
    $prid = $base->escape_string($_POST['id']);
    $weight = floatval($_POST['weight']);
    if (!$base->query("UPDATE `backup_menus` SET `weight` = '".
            $weight."' WHERE `id` = '".$prid."' AND `iduser`='".$user_id."';")){
        dieDB($base->error);
    }
    echo json_encode(1);
}        
function clearMenuFromProd(){//Эта функция удаляет из меню по id продукта
    global $base,$user_id;
    $prod_id = $base->escape_string($_POST['id']);
    //Теперь удаляем этот продукт из меню
    if (!$base->query("DELETE FROM `backup_menus` WHERE `id` = '".$prod_id.
            "' AND `iduser`='".$user_id."';")){
        dieDB($base->error);
    }
   echo json_encode(1);
}        
function addProd(){
    global $base,$user_id;
    
    $prod_name = $base->escape_string($_POST['name']);
    $prod_prot = floatval($_POST['prot']);
    $prod_fat = floatval($_POST['fat']); 
    $prod_carb  = floatval($_POST['carb']);
    $prod_gi = intval($_POST['gi']);
    $prod_gr_id = intval($_POST['gr_id']);
    
    if (!$base->query("INSERT INTO `backup_prods` (`iduser`, `idgroup`, `name`, `prot`, `fat`, `carb`, `gi`, `weight`) "//Поля cmpl и usage заполняются нулями автоматически
                . "VALUES ('".$user_id."', '".$prod_gr_id."', '".$prod_name."', '".$prod_prot."', '".$prod_fat."', '".$prod_carb."', '".$prod_gi.
                "', '100');")){
        dieDB($base->error);
    }
    echo json_encode(1);
}        
function editProd(){//Возможно при таком редактировании следует менять тип продукта
    //со сложного на простой
    //при этом следует удалять состав сложного продукта
    global $base,$user_id;
    $prod_id = intval($_POST['prid']);
    $prod_name = $base->escape_string($_POST['name']);
    $prod_prot = floatval($_POST['prot']);
    $prod_fat = floatval($_POST['fat']); 
    $prod_carb  = floatval($_POST['carb']);
    $prod_gi = intval($_POST['gi']);
    $prod_gr_id = intval($_POST['gr_id']);
    
    if (!$base->query("UPDATE `backup_prods` SET `name` = '".$prod_name.
            "', `prot`='".$prod_prot."', `fat`='".$prod_fat."', `carb`='".
            $prod_carb."', `gi`='".$prod_gi."', `weight`='100', `cmpl`='0', `idgroup`='".$prod_gr_id.
            "' WHERE `id` = '".$prod_id."' AND `iduser`='".$user_id."';")){
        dieDB($base->error);
    }
    //Теперь удаляем состав продукта
    if (!$base->query("DELETE FROM `backup_cmpl` WHERE `idprod`='".$prod_id.
            "' AND `iduser`='".$user_id."';")){
        dieDB($base->error);
    }
    echo json_encode(1);
}        
function deleteProd(){
    global $base,$user_id;
    $prod_id = intval($_POST['prid']);
    if (!$base->query("DELETE backup_cmpl, backup_prods
                        FROM `backup_cmpl`
                        RIGHT OUTER JOIN `backup_prods`
                        ON backup_prods.id=backup_cmpl.idprod
                        WHERE backup_prods.id='".$prod_id.
            "' AND backup_prods.iduser='".$user_id."';")){
        dieDB($base->error);
    }
    echo json_encode(1);
}        
function removeProdFromMenu(){//Эта функция удаляет из меню по idorig продукта
    global $base,$user_id;
    $prod_id = intval($_POST['prodid']);
    //Сначала уменьшаем счетчик использования
    if (!$base->query("UPDATE `backup_prods` SET `usage` = `usage`- 1 WHERE `id` = '".
            $prod_id."' AND `usage`>0 AND `iduser`='".$user_id."';")){
        dieDB($base->error);
    }
    //Теперь удаляем этот продукт из меню
    if (!$base->query("DELETE FROM `backup_menus` WHERE `idorig` = '".$prod_id.
            "' AND `iduser`='".$user_id."';")){
        dieDB($base->error);
    }
   echo json_encode(1);
}        
function addProd2Menu(){
    global $base,$user_id;
    $prod_id = intval($_POST['prodid']);
    
    //Сначала увеличиваем счетчик использования
    //UPDATE `backup_prods` SET `usage` = '15' WHERE `backup_prods`.`id` = 3333932;
    if (!$base->query("UPDATE `backup_prods` SET `usage` = `usage`+1 WHERE `id` = '".
            $prod_id."' AND `iduser`='".$user_id."';")){
        dieDB($base->error);
    }
    //Вынимаем продукт из БД
    if (!$res=$base->query(
        "SELECT `id`, `name`, `prot`, `fat`, `carb`, `gi`, `weight` FROM `backup_prods` WHERE `id`='".
            $prod_id."' AND `iduser`='".$user_id."';")){
        dieDB($base->error);
    }
    if ($res->num_rows==1){
        $row=$res->fetch_assoc();
        $res->close();
        //Теперь добавляем в меню
        //"INSERT INTO `backup_groups` (`iduser`,`name`, `sortind`)
        //    VALUES ('".$user_id."', '".$base->escape_string($gr_name)."', '".$sort_ind."');")){
        if (!$base->query("INSERT INTO `backup_menus` (`iduser`, `name`, `prot`, `fat`, `carb`, `gi`, `weight`, `issnack`, `idorig`) "
                . "VALUES ('".$user_id."', '".$row['name']."', '".$row['prot']."', '".$row['fat']."', '".$row['carb']."', '".$row['gi'].
                "', '0', '0', '".$prod_id."');")){
            dieDB($base->error);
        }
    }else{
        dieDB($base->error);
    }
    
    echo json_encode(1);
}
function giveArchiveProds(){
    global $base;
    $gr_id = intval($_POST['grid']);
    if (!$res=$base->query("SELECT `id`,`name`,`prot`,`fat`,`carb`,`gi` FROM `arcprods` WHERE `idgroup`='".
            $gr_id."' ORDER BY `name`;")){
        dieDB($base->error);
    }
    //Формируем ответ
    while ($row=$res->fetch_assoc()){
        $prods[]= array(
            'id'    =>$row['id'],
            'name'  =>$row['name'],
            'prot'  =>$row['prot'],
            'fat'   =>$row['fat'],
            'carb'  =>$row['carb'],
            'gi'    =>$row['gi']
        );
    }
    $res->close();
    //Отдаем
    if (isset($prods)){
        echo json_encode($prods);
    }else{
        echo json_encode(null);
    }
}
function giveProds(){
    global $base,$user_id;
    $gr_id = intval($_POST['grid']);
    if ($gr_id==0){//Отдаем часто используемые
        //Сначала смотрим сколько продуктов установлено в настройках
        //Пробуем загрузить настройки
        if (!$res=$base->query("SELECT `freqcount` FROM `settings` WHERE `iduser`='".$user_id."';")){
            dieDB($base->error);
        }
        if ($res->num_rows>0){
            $row = $res->fetch_assoc();
            $limit = $row['freqcount'];
        }else{
            $limit = 15;
        }
        $res->close();
        if (!$res=$base->query("SELECT `id`,`name`,`prot`,`fat`,`carb`,`gi` FROM `backup_prods` WHERE `iduser`=$user_id ORDER BY `usage` DESC LIMIT $limit;")){
            dieDB($base->error);
        }
    }else{
        if (!$res=$base->query("SELECT `id`,`name`,`prot`,`fat`,`carb`,`gi` FROM `backup_prods` WHERE `idgroup`='".
                $gr_id."' AND `iduser`='".$user_id."' ORDER BY `name`;")){
            dieDB($base->error);
        }
    }
    //Формируем ответ
    while ($row=$res->fetch_assoc()){
        $prods[]= array(
            'id'    =>$row['id'],
            'name'  =>$row['name'],
            'prot'  =>$row['prot'],
            'fat'   =>$row['fat'],
            'carb'  =>$row['carb'],
            'gi'    =>$row['gi']
        );
    }
    $res->close();
    //Отдаем
    if (isset($prods)){
        echo json_encode($prods);
    }else echo json_encode(null);
}        
function swapGroups(){
    global $base,$user_id;
    $lower = intval($_POST['lower']);
    $upper = intval($_POST['upper']);
    //Сначала надо получить sort ind
    if (!$res=$base->query("SELECT id,sortind FROM `backup_groups` WHERE (id='".
            $upper."' OR id='".$lower."') AND `iduser`='".$user_id."';")){
        dieDB($base->error);
    }
    if ($res->num_rows==2){//все хорошо
        while($row=$res->fetch_assoc()){
            $gr[]=$row;
        }
        $res->close();
        //UPDATE `backup_groups` SET `sortind` = '2' WHERE `backup_groups`.`id` = 238028
        if (!$base->query("UPDATE `backup_groups` SET `sortind` = '".
                $gr[0]['sortind']."' WHERE `id` = '".$gr[1]['id']."' AND `iduser`='".$user_id."';")){
            dieDB($base->error);
        }
        if (!$base->query("UPDATE `backup_groups` SET `sortind` = '".
                $gr[1]['sortind']."' WHERE `id` = '".$gr[0]['id']."' AND `iduser`='".$user_id."';")){
            dieDB($base->error);
        }
        echo json_encode(1);
    }
}        
function editGroup(){
    global $base,$user_id;
    $gr_name = $base->escape_string($_POST['grname']);
    $grid = intval($_POST['grid']);
    if (!$base->query("UPDATE `backup_groups` SET `name` = '".$gr_name.
            "' WHERE `backup_groups`.`id` = '".$grid.
            "' AND `iduser`='".$user_id."';")){
        dieDB($base->error);
    }
    echo json_encode(1);
}
function addGroup(){
    global $base,$user_id;
    $gr_name = $base->escape_string($_POST['grname']); //backup_groups.iduser
    if (!$res=$base->query("SELECT `sortind` FROM `backup_groups` WHERE `iduser`='".
            $user_id."' ORDER BY `sortind` DESC LIMIT 1;")){
        dieDB($base->error);
    }    
    if ($res->num_rows==1){
        $row=$res->fetch_assoc();
        $res->close();
        $sort_ind = $row['sortind'] + 1;
    }else{//Записей в БД еще нет
        $sort_ind = 1;
    }
    //Теперь добавляем новую строку в БД
    if (!$base->query("INSERT INTO `backup_groups` (`iduser`,`name`, `sortind`)
            VALUES ('".$user_id."', '".$gr_name."', '".$sort_ind."');")){
        dieDB($base->error);
    }
    //Формируем ответ
    $new_id = $base->insert_id;
    echo json_encode($new_id);
}   

function giveMenu(){
    global $base,$user_id;
    if ($res=$base->query("SELECT k1, k2, k3, sh1, sh2, be
                            FROM backup_users
                            WHERE id=$user_id;") and $res->num_rows==1){
        $row=$res->fetch_assoc();
        $res->close();
        $k1 = $row["k1"];
        $k2 = $row["k2"];
        $k3 = $row["k3"];
        $sh1 = $row["sh1"];
        $sh2 = $row["sh2"];
        $be = $row['be'];
    }else{
        dieDB($base->error);
    }
    //Теперь формируем меню в массив
    $menu = array();
    if ($res=$base->query("SELECT `id`, `name`, `prot`, `fat`, `carb`, `gi`, `weight`, `issnack`, `idorig`
        FROM `backup_menus` WHERE iduser=$user_id ORDER BY `name`;") and $res->num_rows>0){
        while ($row=$res->fetch_assoc()){
            $menu[] = array( 'id'       => $row["id"], 
                              'name'    => $row["name"], 
                              'prot'    => $row["prot"], 
                              'fat'     => $row["fat"], 
                              'carb'    => $row["carb"], 
                              'gi'      => $row["gi"], 
                              'weight'  => $row["weight"],
                              'idorig'  => $row['idorig']);
        }
        $res->close();
    }//Иначе либо ошибка, либо меню пустое.
    $arr = array(  'k1' => $k1, 
                'k2'    => $k2, 
                'k3'    => $k3, 
                'sh1'   => $sh1, 
                'sh2'   => $sh2,
                'be'    => $be,
                'menu'  => $menu );
    echo json_encode($arr);
}       

function deleteGroup(){
    global $base,$user_id;
    $gr_id = intval($_POST['grid']);
    /*
     * if (!$base->query("DELETE FROM `backup_cmpl` WHERE iduser=$id;")) die('Ошибка при запросе к БД');
   if (!$base->query("DELETE FROM `backup_prods` WHERE iduser=$id;")) die('Ошибка при запросе к БД');
   if (!$base->query("DELETE FROM `backup_groups` WHERE iduser=$id;")) die('Ошибка при запросе к БД');
     */
    if (!$base->query("DELETE backup_cmpl, backup_prods, backup_groups
	FROM `backup_cmpl`
		INNER JOIN `backup_prods`
		ON backup_prods.id=backup_cmpl.idprod
			INNER JOIN backup_groups
        WHERE backup_groups.id='".$gr_id.
            "' AND backup_prods.idgroup='".
            $gr_id."' AND backup_groups.iduser='".$user_id."';")){
        echo json_encode(intval(0));
        return;
    }
    if (!$base->query("DELETE FROM `backup_prods` WHERE `idgroup`='".
            $gr_id."' AND `iduser`='".$user_id."';")){
        echo json_encode(intval(0));
        return;
    }
    if (!$base->query("DELETE FROM backup_groups WHERE id='".
            $gr_id."' AND `iduser`='".$user_id."';")){
        echo json_encode(intval(0));
        return;
    }
    
    echo json_encode(intval(1));
}

function giveGroups(){
    global $base,$user_id;
    
    if (!$res=$base->query("SELECT `usefreq` FROM `settings` WHERE `iduser`='".$user_id."';")){
            dieDB($base->error);
        }
        if ($res->num_rows>0){
            $row = $res->fetch_assoc();
            $use_freq = $row['usefreq'];
        }else{
            $use_freq = 0;
        }
        $res->close();
    if ($use_freq){//надо добавить проверку на использование группы Частоиспользуемые
        $groups[] = array( 'id'         => 0,
                           'name'       => 'Частоиспользуемые',
                           'sortind'    =>0);
    }
    if ($res=$base->query("SELECT `id`, `name`, `sortind` FROM `backup_groups` WHERE `iduser`='".
            $user_id."' ORDER BY sortind ASC;")){
        while ($row=$res->fetch_assoc()){
            $groups[] = array( 'id'         => $row['id'],
                               'name'       => $row['name'],
                               'sortind'    => $row['sortind']);
        }
        $res->close();
    }
    if (isset($groups)){
        echo json_encode($groups);
    }
}

function giveCountedGroups(){
   global $base,$user_id;
   //делаем запрос в БД 
    //Делаем два запроса
   if (!$res=$base->query("SELECT gr.id, gr.name, count(pr.id) AS prodsPerGroup
                            FROM backup_prods pr 
                                INNER JOIN backup_groups gr ON pr.idgroup=gr.id 
                                WHERE gr.iduser=$user_id
                                GROUP BY gr.id ORDER BY gr.sortind;")){
       dieDB($base->error);
   }
   //$groups_c = array();
   if ($res->num_rows>0){
        //Есть что делать
        while ($row=$res->fetch_assoc()){
            $groups_c[] = array( 'id'  =>$row['id'],
                                'name' =>$row['name'],
                                'prPgr'=>$row['prodsPerGroup']);

        }
        $res->close();
        //echo json_encode($groups);
    }
    if (!$res=$base->query("SELECT gr.id, gr.name FROM backup_groups gr WHERE gr.iduser=$user_id ORDER BY gr.sortind;")){
       dieDB($base->error);
    }
        
    if ($res->num_rows>0){
        //Есть что делать
        while ($row=$res->fetch_assoc()){
            $groups_uc[] = array( 'id'   =>$row['id'],
                                  'name' =>$row['name'],
                                  'prPgr'=> 0);

        }
        $res->close();
        //echo json_encode($groups);
    }
    if (count($groups_c)>0 and count($groups_c)==count($groups_uc)){//Если группы не пустые и кол-во совпадает, то отдаем groups_c
        echo json_encode($groups_c);
    }
    else if (count($groups_c)==0 and count($groups_uc)==0){//Групп нет
        echo json_encode(0);
    }else{//Группы есть, но есть и пустые группы
        //Теперь объединяем списки. Нулевой список ($groups_uc) всегда длиннее, поэтому делаем на его основе
        for($i=0;$i<count($groups_uc);$i++){
            //$groups_uc[$i]['prPgr'] = $groups_c[$i]['prPgr'];
            for($j=0;$j<count($groups_c);$j++){
                if ($groups_uc[$i]['id'] == $groups_c[$j]['id']){
                    $groups_uc[$i]['prPgr'] = $groups_c[$j]['prPgr'];
                    array_splice($groups_c, $j, 1);
                    break;
                }
            }
        }
        echo json_encode($groups_uc);
    }
}
