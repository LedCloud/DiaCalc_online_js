<?php
if (!defined('IN_DCONLINE'))
{
    exit;
}
//DEFINE('DEBUG',true);

//~ Старт сессии, файл должен быть сохранен без DOM информации
session_name('dcsid');
session_start(['use_only_cookies'=>0]);
//session_start();
//error_reporting(E_ALL);

require_once 'conf.php';
require_once 'functions.php';
require_once 'Mobile_Detect.php';

class auth {
    function setUseMobile($use){//$use - true or false
        global $one_day;
        setcookie('use_mobile', $use?'yes':'no', time()+$one_day*14);
        $_SESSION['use_mobile'] = $use?'yes':'no';
    }
    function useMobile(){
        global $one_day;
        if (isset($_SESSION['use_mobile'])){
            $use = $_SESSION['use_mobile'];
            setcookie('use_mobile', $use, time()+$one_day*14);
            return $use=='yes';
        }elseif (isset($_COOKIE['use_mobile'])){
            $use = $_COOKIE['use_mobile'];//Может быть 'yes' или 'no'
            //Надо обновить куку
            setcookie('use_mobile', $use, time()+$one_day*14);
            $_SESSION['use_mobile'] = $use;
            return $use=='yes';
        }
        $detect = new Mobile_Detect;
        // Any mobile device (phones or tablets).
        return $detect->isMobile();
    }
    ///Служебные функции
    function generatePassword($length=9, $strength=7) {
        $vowels = 'aeuy';
        $consonants = 'bdghjmnpqrstvz';
        if ($strength & 1) {
                $consonants .= 'BDGHJLMNPQRSTVWXZ';
        }
        if ($strength & 2) {
                $vowels .= "AEUY";
        }
        if ($strength & 4) {
                $consonants .= '23456789';
        }
        if ($strength & 8) {
                $consonants .= '@#$%';
        }

        $password = '';
        $alt = time() % 2;
        for ($i = 0; $i < $length; $i++) {
                if ($alt == 1) {
                        $password .= $consonants[(rand() % strlen($consonants))];
                        $alt = 0;
                } else {
                        $password .= $vowels[(rand() % strlen($vowels))];
                        $alt = 1;
                }
        }
        return $password;
    }
    function checkLogin($login){//Еще надо добавить проверку длины
        if (empty($login)){
            return 'Поле логина не заполнено';
        }else{
            if (strlen($login)<4 or strlen($login)>25){
                return 'Длина логина должна быть от 4 до 25 символов';
            }
            if (!preg_match('/^[a-zA-Z0-9@#$%]{4,25}$/i',$login)){
                return 'Логин должен содержать символы латинского алфавита или цифры';
            }
        }
        return 'good';
    }
    function checkPass($pass,$pass2){// Проверяем пароль, возвращаем ошибку или ничего.
        if ($pass!=$pass2){
            return 'Пароли не совпадают';
        }else{
            if (empty($pass)){
                return 'Поле пароля не заполнено';
            }else if (strlen($pass)<6 or strlen($pass)>30){
                return 'Длина пароля должна быть от 6 до 30 символов';
            }
            else if (!preg_match('/^[a-z0-9]{6,30}$/i',$pass)){
                return 'Пароль должен содержать символы латинского алфавита или цифры';
            }
        }
        return 'good';
    }
    function checkEmail($email){
        if (empty($email)){
            return 'Поле email не заполнено';
        }
        else if (!preg_match('/^[-0-9a-z_\.]+@[-0-9a-z^\.]+\.[a-z]{2,4}$/i',$email)){
            //Делаем проверку на правильно ввода E-Mail адреса.
            return 'Некорректный email';
        }
        return 'good';
    }
    function getCoefs($user_id){
        global $base;
        if (!$res=$base->query(
            "SELECT `id`,`time`,`k1`,`k2`,`k3` FROM `coefs` WHERE `iduser`='".
                $user_id."' ORDER BY `time`;")){
            dieDB($base->error);
        }
        $coefs = array();
        while($row=$res->fetch_assoc()){
            $coefs[] = array(
                'id'      => $row['id'],
                'time'    => $row['time'],
                'k1'      => $row['k1'],
                'k2'      => $row['k2'],
                'k3'      => $row['k3']
            );
        }
        $res->close();
        return $coefs;
    }
    function getBE($user_id){
        global $base;
        if (!$res=$base->query(
            "SELECT `be` FROM `backup_users` WHERE `id`='".
                $user_id."';")){
            dieDB($base->error);
        }
        $be = 10;
        if($row=$res->fetch_assoc()){
            $be = $row['be'];
        }
        $res->close();
        return $be;
    }
    function getSettings($user_id){//return settings array
        global $base;
        //Пробуем загрузить настройки
        if (!$res=$base->query(
            "SELECT `menuinfo`, `roundto`, `shwhole`, `mmol`, `shtarget`, `usefreq`, "
                . "`freqcount`, `filteroff`, `k3factor`,`weight`, `timedcoefs`, "
                . " `calorlimit`, `shlow`, `shhigh`, `period` FROM `settings` "
                . "WHERE `iduser`='".$user_id."';")){
            dieDB($base->error);
        }
        if ($res->num_rows==0){//Таблица пустая, заполняем занчениями по умолчанию
            $res->close();
            //Значения "по умолчанию" можно не заполнять
            if (!$base->query("INSERT INTO `settings`(`iduser`) VALUES ".
                    "('".$user_id."')")){
                dieDB($base->error);
            }
            //Теперь надо инициализировать массив настроек
            $settings = array(
                'menuinfo' => 152,
                'roundto'  => 0,
                'whole'  => 0,
                'mmol'     => 1,
                'shtarget' => 5.6, 0, 1,
                'usefreq'  => 1,
                'freqcount'=> 15,
                'filteroff'=> 25,
                'k3factor' => 187,
                'weight'   => 60,
                'timedcoefs'=> 0,
                'calorlimit'=> 2000,
                'shlow'     => 3.2,
                'shhigh'    => 8,
                'preriod'   => 7,
            );
        }else{
            $row=$res->fetch_assoc();
            $settings = array(
                'menuinfo' => $row['menuinfo'],
                'roundto'  => $row['roundto'],
                'whole'  => $row['shwhole'],
                'mmol'     => $row['mmol'],
                'shtarget' => $row['shtarget'],
                'usefreq'  => $row['usefreq'],
                'freqcount'=> $row['freqcount'],
                'filteroff'=> $row['filteroff'],
                'k3factor' => $row['k3factor'],
                'weight'   => $row['weight'],
                'timedcoefs'=>$row['timedcoefs'],
                'calorlimit'=>$row['calorlimit'],
                'shlow'     => $row['shlow'],
                'shhigh'    => $row['shhigh'],
                'period'    => $row['period'],
            );
        }
        //Добавим данные о калориях
        if (!$res=$base->query("SELECT `eaten`, `eatendate` FROM `backup_users` WHERE `id`='".
                $user_id."';")){
            dieDB($base->error);
        }
        if ($row = $res->fetch_assoc()){
            $settings['eaten'] = $row['eaten'];
            $settings['eatendate'] = $row['eatendate'];
        }
        $res->close();
        return $settings;
    }
    function getArchiveGroups(){
        global $base;
        if (!$res=$base->query("SELECT `id`, `name` FROM `arcgroups` ORDER BY `name` ASC;")){
            dieDB($base->error);
        }
        while ($row=$res->fetch_assoc()){
            $groups[] = array( 'id' => $row['id'],
                                'name'=> $row['name']);
        }
        $res->close();
            
        return $groups;
    }
    function getGroups($user_id,$settings){
        global $base;
        if (!$res=$base->query("SELECT `id`, `name`, `sortind` FROM `backup_groups` WHERE `iduser`='".
                $user_id."' ORDER BY sortind ASC;")){
            dieDB($base->error);
        }
        if ($settings['usefreq']){//Если используем частоиспользуемые продукты
            $groups[] = array( 'id' => 0,
                                'name'=> 'Частоиспользуемые',
                                'sortind'=> 0 );
        }
        while ($row=$res->fetch_assoc()){
            $groups[] = array( 'id' => $row['id'],
                                'name'=> $row['name'],
                                'sortind'=>$row['sortind']);
        }
        $res->close();
            
        return $groups;
    }
    
    function registerNewUser($login,$mail1,$mail2){
        global $base;
        $r = $this->checkLogin($login);
        if ($r!='good'){
            $error[] = $r;
        }
        if ($mail1!=$mail2){
            $error[] = "Введенные email'ы не совпадают.";
        }
        $r = $this->checkEmail($mail1);
        if ($r!='good'){
            $error[] = $r;
        }
        if (isset($error)){
            return $error;
        }
        if (!$res=$base->query("SELECT `login` FROM `backup_users` WHERE `login`='".
                $base->escape_string($login)."';")){
            dieDB($base->error);
        }
        if ($res->num_rows>0){
            $error[] = 'Логин занят';
        }
        $res->close();
        
        if ($mail1!==$mail2){
            $error[] = "Email'ы должны совпадать";
        }else{
            if (!$res=$base->query("SELECT `email` FROM `backup_users` WHERE `email`='".
                    $base->escape_string($mail1)."';")){
                dieDB($base->error);
            }
            if ($res->num_rows>0){
                $error[] = 'Указанный email уже используется';
                $mail1 = '';
            }
            $res->close();
        }
        if (isset($error)){//Ошибок нет - регистрируем
            return $error;
        }
        
        $passwd = $this->generatePassword(10,7);
        $passwd_sql = password_hash($passwd, PASSWORD_DEFAULT);
        if (!$base->query("INSERT INTO `backup_users` (`login`, `pass`, `email`, `lastuse`)
                      VALUES ('".$base->escape_string($login)."', '".
                $passwd_sql."', '".$base->escape_string($mail1)."', '".time()."');")){
            dieDB($base->error);
        }
        $addr = "https://".$_SERVER['SERVER_NAME'].$_SERVER['PHP_SELF'];
        $pos = strpos($addr, "join.php");
        
        $admin = 'admin@diacalc.org';
        $subject = 'Регистрация учетной записи программы DiaCalc';
        $message2user = "Кто то, возможно Вы, зарегистрировал учетную запись, позволяющую\n".
        "использовать интернет возможности программы DiaCalc https://".$_SERVER['SERVER_NAME']."\n".
        "Если это были не Вы, то ничего не предпринимайте, учетная запись будет удалена\n".
        "автоматически по прошествии некоторого времени.\n\n".
        "Если это были Вы, то параметры учетной записи следующие:\n".
        "Логин: ".$login."\nпароль: ".$passwd."\nсохраните это письмо.\n\n".
        "Если Вы потеряете пароль, то его можно восстановить по адресу\n".
        substr($addr,0,$pos)."recovery.php\n".
        "Изменить пароль можно по адресу ".substr($addr,0,$pos)."changepass.php\n\nУдачи!";
        
        $message2admin = "Зарегистрирована новая учетная запись online\n".
        "login: ".$login."\nemail: ".$mail1;
        
        if (!mail_utf8($mail1,$subject,$message2user,$admin) ||
                !mail_utf8($admin,$subject,$message2admin,$admin)){
            $error[] = 'В данный момент регистрация невозможна, свяжитесь с администрацией';
            return $error;
        }
        return 'good';
    }
    ###
    #	Проверка авторизации
    function check() {
        global $one_day,$base;
        if (isset($_SESSION['id_user']) and isset($_SESSION['login_user']) 
                and isset($_SESSION['passwd_user'])){
            //Теперь вынимаем пароль из БД и сравниваем его с записью в сессии
            if ($res=$base->query("SELECT `pass` FROM `backup_users` WHERE `id`='".
                    $_SESSION['id_user']."';") ){
                if ($res->num_rows==1){//есть такая запись
                    $row=$res->fetch_row();
                    $res->close();
                    if ($row[0]==$_SESSION['passwd_user']){//тут сравниваем не пароли, а хэши паролей
                        return true;
                    }
                }
            }else{
                dieDB($base->error);
            }
            return false;
        }
        else {
            //~ проверяем наличие кук
            if (isset($_COOKIE['id_user']) and isset($_COOKIE['code_user'])) {
                //~ куки есть - сверяем с таблицей сессий
                
                //Вот тут нужно почистить таблицу сессий от устаревших данных.
                $now = time();
                $fourteendaysago = $now - $one_day*14;
                if (!$base->query("DELETE FROM `session` WHERE `lastuse`<'".$fourteendaysago."';")){
                    //Произошла ошибка при доступе к БД
                    dieDB($base->error);
                }
                
                $id_user=$base->escape_string(trim(($_COOKIE['id_user'])));
                $code_user=$base->escape_string(trim(($_COOKIE['code_user'])));

                //Обновляем у пользователя дату доступа и чистим таблицы от старых пользователей.
                if (!$base->query("UPDATE `backup_users` SET `lastuse`='".time().
                        "' WHERE `id`='".$id_user."';")){
                    dieDB($base->error);
                }
                
                $this->cleanBase();
                //Тут делаем чистый запрос и обрабатываем его без обертки
                //Нужно полчить id сессии
                if ($res=$base->query("SELECT `code_sess` FROM `session` WHERE `id_user`=".
                        $id_user." AND `code_sess`='".$code_user.
                        "' AND `user_agent_sess`='".$_SERVER['HTTP_USER_AGENT']."';")){
                    if ($res->num_rows==1){
                        //Есть такая запись, получаем ее id
                        $row = $res->fetch_row();
                        $id_sess = $row[0];
                        $res->close();
                        //Вынимаем логин из таблицы пользователей;
                        if (!$res=$base->query("SELECT `login`, `pass` FROM `backup_users` WHERE `id` = '".$id_user."';")){
                            dieDB($base->error);
                        }
                        $row = $res->fetch_row();

                        $_SESSION['id_user']=$id_user;
                        $_SESSION['login_user']=$row[0];
                        $_SESSION['passwd_user']=$row[1];
                        $res->close();

                        //~ обновляем куки
                        setcookie("id_user", $_SESSION['id_user'], $now+$one_day*14);//каждый раз продление на 14 дней
                        setcookie("code_user", $code_user, $now+$one_day*14);
                        //теперь надо обновить таблицу сессий;
                        if (!$base->query("UPDATE `session` SET `lastuse`='".$now."' WHERE `code_sess`='".$id_sess."';")){
                            dieDB($base->error);
                        }
                        return true;
                    }
                }else{
                    dieDB($base->error);
                }
            }
        }
        //Запрос не был выполнен или вернул пустой результат.
        //Кук нет, нужна авторизация
        return false; //Сюда попасть не должны ни при каких условиях.
    }
    ####
    #.
        
    function changePassword($old_pass,$new_pass1,$new_pass2){
        global $base;
        $r = $this->checkPass($old_pass, $old_pass);
        if ($r!='good'){
            $error[] = $r;
        }
        $r = $this->checkPass($new_pass1, $new_pass2);
        if ($r!='good'){
            $error[] = $r;
        }
        if (isset($error)){
            return $error;
        }
        
        $id_user = $_SESSION['id_user'];
        $new_passwd_sql = password_hash($new_pass1, PASSWORD_DEFAULT);
        if ($res=$base->query("SELECT `pass` FROM `backup_users` WHERE `id`='".$id_user."';")){
            if ($res->num_rows==1){
                //Запрос выполнился, т.к. id_user уникальное поле, то в ответе может быть только один ряд
                $row = $res->fetch_row();
                $res->close();//Данные нам не нужны
                //Сравниваем пароли
                if (password_verify($old_pass, $row[0])){
                    //Старый пароль верен, меняем
                    if (!$base->query("UPDATE `backup_users` SET `pass` = '".
                            $new_passwd_sql."' WHERE `id`='".$id_user."';")){
                        dieDB($base->error);
                    }
                    //Вот тут нужно разлогинить всех на других устройствах.
                    $code_user=$base->escape_string(trim(($_COOKIE['code_user'])));
                    if (!$base->query("DELETE FROM `session` WHERE `id_user`='".
                            $id_user."' AND `code_sess`<>'".$code_user."';")){
                        dieDB($base->error);
                    }
                    $_SESSION['passwd_user'] = $new_passwd_sql;// Записали в сессию новый хэш пароля.
                }else{
                    $error[] = 'Старый пароль указан неверно';
                }
            }else{
                //Почему-то в ответе не одна запись
                $error[] = 'Strange error';
            }
        }else{
            dieDB($base->error);
        }
        if (isset($error)){
            return $error;
        }
        return 'good';
    }
    ###
    #	Авторизация
    function authorization() {
        global $base, $one_day;
        $login = $base->escape_string(trim($_POST['login']));
        $passwd = trim($_POST['passwd']);
        if ($res=$base->query("SELECT `id`, `pass` FROM `backup_users` WHERE  `login` =  '".
                $login."';")){
            if ($res->num_rows==1){
                //есть такой пользователь
                $row = $res->fetch_row();
                $res->close();
                //Теперь надо сравнить пароль
                if (password_verify($passwd, $row[1])){
                    $_SESSION['id_user']=$row[0];
                    $_SESSION['login_user']=$login;
                    $_SESSION['passwd_user']=$row[1];

                    //очищаем таблицу сессий от устаревших записей
                    $now = time();
                    $fourteendaysago = $now - $one_day*14;
                    if (!$base->query("DELETE FROM session WHERE `lastuse`<'".$fourteendaysago."';")){
                        //Произошла ошибка при доступе к БД
                        dieDB($base->error);
                    }
                    //~ добавляем/обновляем запись в таблице сессий и ставим куку
                    $r_code = $this->generatePassword(30,2);
                    //так как это новая авторизация, то нужно делать новую запись в таблицу сессий.
                    //не смотря на то, что у пользователя уже могли быть записи в таблице сессий.
                    //Нужно предусмотреть удаление записи из таблицы БД при разлогинивании
                    if (!$base->query("INSERT INTO `session` (`id_user`, `code_sess`, `user_agent_sess`, `lastuse`) VALUES ('".
                            $_SESSION['id_user']."', '".$r_code."', '".$_SERVER['HTTP_USER_AGENT']."', '".$now."');")){
                            //не смогли
                        dieDB($base->error);
                    }
                    //~ ставим куки на 2 недели
                    setcookie("id_user", $_SESSION['id_user'], $now+$one_day*14);//устанавливаем на 14 дней
                    setcookie("code_user", $r_code, $now+$one_day*14);
                    return 'good';
                }else{
                    //пароль указан неверно.
                    $error[]='Введен неверный пароль';
                }
            }else{
                $error[] = 'Нет такого пользователя';
            }
        }else{//Нет такого пользователя или ошибка при запросе к БД
            dieDB($base->error);
        }
        //Если сюда попали, то точно есть ошибки.
        if (isset($error)){
            return $error;
        }
        //Заглушка на всякий случай
        return array('Strange days are comming');
    }
    ###
    #	Выход
    function exit_user() {
        global $base;
        //Тут мы должны удалить запись из таблицы сессий.
        if (!isset($_SESSION['id_user'])){
            die('id is not set');
        }
        $id_user=$_SESSION['id_user'];
        $code_user=$base->escape_string(trim(($_COOKIE['code_user'])));
        //Тут делаем чистый запрос и обрабатываем его без обертки
        //Нужно полчить id сессии
        if (!$base->query("DELETE FROM `session` WHERE `id_user`=".$id_user." AND `code_sess`='".$code_user.
                            "' AND `user_agent_sess`='".$_SERVER['HTTP_USER_AGENT']."';")){
            dieDB($base->error);
        }
        //~ разрушаем сессию, удаляем куки и отправляем на главную
        session_destroy();
        setcookie("id_user" ,   '',     time()-3600);
        setcookie("code_user", '', time()-3600);
        setcookie('use_mobile','', time()-3600);
        header("Location: login.php");
    }
    ###
    #	Восстановление пароля
    function recovery_pass($login, $mail) {
        global $base;
        if ($res=$base->query("SELECT `id`,`login`,`email` FROM `backup_users` WHERE `login`='".
                $base->escape_string(trim($login))."';")){
            if ($res->num_rows==1){//Нашли этого пользователя
                $db_inf=$res->fetch_assoc();
                $res->close();
                //~ проверка email т.к. уже есть этот мейл в базе, то проверка не нужна.
                if (!$this->checkEmail($mail)){
                    $error[]='Введен некорректный email';
                }
                else if ($mail!=$db_inf['email']){
                    $error[]='Введенный email не соответствует введенному при регистрации ';
                }
                if (!isset($error)) {
                    //~ восстанавливаем пароль
                    // тут же можно удалить записи из таблицы сессий, так как все равно от них толку уже не будет.
                    $new_passwd = $this->generatePassword(10,7);
                    $new_passwd_sql = password_hash($new_passwd, PASSWORD_DEFAULT);
                    if (!$base->query("UPDATE `backup_users` SET `pass`='".$new_passwd_sql.
                            "' WHERE `id` = ".$db_inf['id'].";")){
                        dieDB($base->error);
                    }
                    
                    $addr = "https://".$_SERVER['SERVER_NAME'].$_SERVER['PHP_SELF'];
                    $pos = strpos($addr, "recovery.php");
                    $admin = 'admin@diacalc.org';
                    $subject = 'Восстановление пароля программы Diacalc';
                    $message = "Вы запросили восстановление пароля на сайте \n".
                    "https://".$_SERVER['SERVER_NAME']." для учетной записи ".$db_inf['login'].
                    "\nВаш новый пароль: ".$new_passwd."\n\n".
                    "С уважением администрация сайта https://".$_SERVER['SERVER_NAME'];
                    
                    if (mail_utf8($mail, $subject, $message, $admin)) {
                        //~ все успешно - возвращаем положительный ответ
                        //Чистим таблицу сессий от записей сделанных с других устройств
                        $code_user=$base->escape_string(trim(($_COOKIE['code_user'])));
                        if (!$base->query("DELETE FROM `session` WHERE `id_user`='".
                                $db_inf['id_user']."' AND `code_sess`<>'".$code_user."';")){
                            dieDB($base->error);
                        }
                        $_SESSION['passwd_user'] = $new_passwd_sql;// Записали в сессию новый пароль.
                        return 'good';
                    } else {
                        //~ ошибка при отправке письма
                        $error[]='В данный момент восстановление пароля невозможно, свяжитесь с администрацией сайта';
                    }
                }
            }else{
                $res->close();
                //~ не найден такой пользователь
                $error[]='Пользователь с таким именем или email не найден';
            }
        }else {
            dieDB($base->error);
        }
        return $error;
    }
    function storeSettings($settings,$user_id){
        global $base;
        //Интервал дат сохраняем не тут!!!
        //Сохраняем в БД$
        if (!$base->query("UPDATE `settings` SET `menuinfo`='".intval($settings['menuinfo']).
                "', `roundto`='".intval($settings['roundto']).
                "', `shwhole`='".intval($settings['whole']).
                "', `mmol`='".intval($settings['mmol']).
                "',`shtarget`='".floatval($settings['shtarget']).
                "', `usefreq`='".intval($settings['usefreq']).
                "', `freqcount`='".intval($settings['freqcount']).
                "', `filteroff`='".intval($settings['filteroff']).
                "', `calorlimit`='".intval($settings['calorlimit']).
                "', `shlow`='".floatval($settings['shlow']).
                "', `shhigh`='".floatval($settings['shhigh']).
                "' WHERE `iduser`='".$user_id."';")){
            dieDB($base->error);
        }
        //Если не сохранили, то умерили, ответ поэтому не нужен
    }
    
    function cleanAndFillBase($user_id){
        global $base;
        //Очистка 
        if (!$base->query("DELETE FROM `backup_cmpl` WHERE iduser=$user_id;")){
            dieDB($base->error);
        }
        if (!$base->query("DELETE FROM `backup_prods` WHERE iduser=$user_id;")){
            dieDB($base->error);
        }
        if (!$base->query("DELETE FROM `backup_groups` WHERE iduser=$user_id;")){
            dieDB($base->error);
        }
        
        $data = json_decode( file_get_contents( 'inc/base.json'), true );
        $groups = $data['groups'];
       
        for($i=0;$i<count($groups);$i++){
            //Добавляем группу
            if (!$base->query("INSERT INTO `backup_groups` (`iduser`,`name`, `sortind`)
                    VALUES ('".$user_id."', '".$base->escape_string($groups[$i]['gr_name'])."', '".($i+1)."');")){
                dieDB($base->error);
            }
        
            $gr_id = $base->insert_id;
            //Теперь добавляем продукты
            $prods = array();
            for($j=0;$j<count($groups[$i]['prods']);$j++){
                $prod = $groups[$i]['prods'][$j];
                $prods[] = "'$user_id', '$gr_id', '".$base->escape_string($prod['name']).
                             "', '".floatval($prod['prot']).
                             "', '".floatval($prod['fat']).
                             "', '".floatval($prod['carb']).
                             "', '".intval($prod['gi']).
                             "', '100.0'";
            }
            if (count($prods)>0){
                //Поля cmpl и usage заполняются нулями автоматически
                if (!$base->query("INSERT INTO `backup_prods` (`iduser`, `idgroup`, `name`, `prot`, `fat`, `carb`, `gi`, `weight`) "
                    . "VALUES (".implode("), (", $prods).");")){
                    dieDB($base->error);
                }
            }
        }
    }
    
    function loadCountedGroups($user_id){
        global $base;
        //Делаем два запроса
        if (!$res=$base->query("SELECT gr.id, gr.name, count(pr.id) AS prodsPerGroup
                                FROM backup_prods pr 
                                    INNER JOIN backup_groups gr ON pr.idgroup=gr.id 
                                    WHERE gr.iduser=$user_id
                                    GROUP BY gr.id ORDER BY gr.sortind;")){
           dieDB($base->error);
        }
        if ($res->num_rows>0){
            //Есть что делать
            while ($row=$res->fetch_assoc()){
                $groups_c[] = array(
                    'id'    => $row['id'],
                    'name'  => $row['name'],
                    'prPgr' => $row['prodsPerGroup']);

            }
        }
        $res->close();
        if (!$res=$base->query(
                "SELECT gr.id, gr.name FROM backup_groups gr WHERE gr.iduser='".
                $user_id."' ORDER BY gr.sortind;")){
            dieDB($base->error);
        }
        if ($res->num_rows>0){
            //Есть что делать
            while ($row=$res->fetch_assoc()){
                $groups_uc[] = array(  
                    'id'    => $row['id'],
                    'name'  => $row['name'],
                    'prPgr' => 0);

            }
        }
        $res->close();
        if (count($groups_c)>0 and count($groups_c)==count($groups_uc)){
            //Если группы не пустые и кол-во совпадает, то отдаем groups_c
            $groups = $groups_c;
        }
        else if (count($groups_c)==0 and count($groups_uc)==0){//Групп нет
            $groups = array();//Пустой массив
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
            $groups = $groups_uc;
        }
        return $groups;
    }
    
    function cleanBase(){
        global $base,$one_year;
        $year_ago = time() - $one_year;
        if ($res=$base->query("SELECT id FROM `backup_users` WHERE `lastuse`<$year_ago;")){
            while($row=$res->fetch_row()){
                $this->deleteUser($row[0]);
            }
            $res->close();
        }else{
            dieDB($base->error);
        }
    }
    
    function deleteUser($id){
       global $base;
       if (!$base->query("DELETE FROM `backup_cmpl` WHERE iduser=$id;")) dieDB ($base->error);
       if (!$base->query("DELETE FROM `backup_diary` WHERE iduser=$id;")) dieDB ($base->error);
       if (!$base->query("DELETE FROM `backup_diaryrecords` WHERE iduser=$id;")) dieDB ($base->error);
       if (!$base->query("DELETE FROM `backup_groups` WHERE iduser=$id;")) dieDB ($base->error);
       if (!$base->query("DELETE FROM `backup_menus` WHERE iduser=$id;")) dieDB ($base->error);
       if (!$base->query("DELETE FROM `backup_prods` WHERE iduser=$id;")) dieDB ($base->error);
       if (!$base->query("DELETE FROM `settings` WHERE iduser=$id;")) dieDB ($base->error);
       if (!$base->query("DELETE FROM `coefs` WHERE iduser=$id;")) dieDB ($base->error);
       if (!$base->query("DELETE FROM `diary` WHERE iduser=$id;")) dieDB ($base->error);
       if (!$base->query("DELETE FROM `diaryrecords` WHERE iduser=$id;")) dieDB ($base->error);
       

       if (!$base->query("DELETE FROM `backup_users` WHERE id=$id;")) dieDB ($base->error);
    }
}


