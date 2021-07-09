<?php
define('IN_DCONLINE', true);
//DEFINE('DEBUG',true);

include_once 'inc/module.php';

$auth = new auth(); //~ Создаем новый объект класса

//~ выход
if (isset($_GET['exit'])){
    $auth->exit_user();
    header('Location: login.php?'.htmlspecialchars(SID));
    exit;
}
//~ Проверка авторизации
if (!$auth->check()){
    header('Location: login.php?'.htmlspecialchars(SID));
    exit();
}

if ( isset($_GET['mobile']) ){
    $auth->setUseMobile(true);
    header('Location: index.php?'.htmlspecialchars(SID));
    exit();
}
if (isset($_GET['desktop'])){
    $auth->setUseMobile(false);
    header('Location: index.php?'.htmlspecialchars(SID));
    exit();
}

require_once( 'libs/Smarty.class.php');
include_once 'inc/functions.php';

$smarty = new Smarty();
$smarty->assign('sid',htmlspecialchars(SID));

$user_id = $_SESSION['id_user'];


$settings = $auth->getSettings($user_id);

$smarty->assign('settings',$settings);

$smarty->assign('groups',$auth->getGroups($user_id, $settings));

$coefs = $auth->getCoefs($user_id);
//Теперь проходим по массиву и приводим его к виду, когда можно показывать.
$coefsView = array();
if ($settings['timedcoefs']){
    if (count($coefs)<2){
        $settings['timedcoefs'] = 0;
    }else{//Тут создаем временные коэф-ты
        for($t=0;$t<24;$t++){
            $before = findBefore( $coefs, $t*60 );
            $after  = findAfter( $coefs, $t*60  );
            $length = $before['diff']+$after['diff'];
            if ($length>0){
                $k1 = $before['k1'] - $before['diff'] * ($before['k1']-$after['k1']) / $length;
                $k2 = $before['k2'] - $before['diff'] * ($before['k2']-$after['k2']) / $length;
                $k3 = $before['k3'] - $before['diff'] * ($before['k3']-$after['k3']) / $length;
            }else{
                $k1 = $before['k1'];
                $k2 = $before['k2'];
                $k3 = $before['k3'];
            }
            if ($t<9){
                $time = '0'.$t.':00';
            }else{
                $time = ''.$t.':00';
            }
            $coefsView[] = array(
                'id'    => $t,
                'time'  => $time,
                'k1'    => number_format($k1,2),
                'k2'    => number_format($k2,2),
                'k3'    => number_format(getSugarView($k3, 
                    $settings['whole'], $settings['mmol']),$settings['mmol']?1:0)
            );
        }
    }
}

if ($settings['timedcoefs']==0){
    foreach ($coefs as $coef){
        //print_r( $coef['id'] );
        $coefsView[] = array(
            'id'    => $coef['id'],
            'time'  => $coef['time'],
            'k1'    => number_format($coef['k1'],2),
            'k2'    => number_format($coef['k2'],2),
            'k3'    => number_format(getSugarView($coef['k3'], 
                $settings['whole'], $settings['mmol']),$settings['mmol']?1:0)
        );
    }
}


if (count($coefs)){
    $smarty->assign('coefs',$coefsView);
}

if ($auth->useMobile()){
    $smarty->display('index.tpl');
}else{
    $smarty->display('index_d.tpl');
}

function getSugarView($value,$whole,$mmol){
    //Изначально храним СК в ммоль и цельной крови
    return $value*($whole?1:1.11)*($mmol?1:18);
}

function findBefore( $cs, $t ){
    $found = count($cs)-1;
    for($i=count($cs)-1;$i>=0;$i--){
        if (getTime($cs[$i]['time'])<=$t){
            $found = $i;
            break;
        }
    }
    // для 7 предыдуший 15, разница д.б. 7 + 24 - 15 = 16
    $d = $t - getTime($cs[$found]['time']);
    if ($d<0){
        $d += 24*60;
    }
    return array(
        'diff' => $d,
        'time' => $cs[$found]['time'],
        'k1'   => $cs[$found]['k1'],
        'k2'   => $cs[$found]['k2'],
        'k3'   => $cs[$found]['k3']
    );
}
function findAfter( $cs, $t ){ //$cs - массив коэф-ов, $t - час в минутах
    //надо вернуть структуру разница в минутах
    //и три коэф-та
    $found = 0;
    for($i=0;$i<count($cs);$i++){
        if (getTime($cs[$i]['time'])>=$t){
            //Нашли, возвращаем найденное
            $found = $i;
            break;
        }
    }
    //Не нашли, Значит надо отдать первый из списка
    //12 - 10 = 2
    //8 - 10 = -2, на самом деле разница - 24-10+8   
    $d = getTime($cs[$found]['time']) - $t;
    if ($d<0){
        $d += 24*60;
    }
    return array(
        'diff' => $d,
        'time' => $cs[$found]['time'],
        'k1'   => $cs[$found]['k1'],
        'k2'   => $cs[$found]['k2'],
        'k3'   => $cs[$found]['k3']
    );
}

function getTime($st){
    $t = explode(':',$st);
    if (count($t)!=2){
        return 0;
    }
    return intval($t[0])*60 + intval($t[1]);
}