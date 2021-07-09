{* Smarty *} 
{include file='header_d.tpl'}
<link rel="stylesheet" type="text/css" href="css/login.css" />
<script src='https://www.google.com/recaptcha/api.js'></script>
</head>
<body>
<div class="container well">
    <h3>Регистрация</h3>
    <p>На данной странице можно зарегистрировать учетную запись программы DiaCalc, которая позволит:
      <ul>
          <li>сохранять базу продуктов, меню на сервере</li>
          <li>синхронизировать базу продуктов и меню <a href="http://diacalc.org/">программы DiaCalcJ</a> между разными экземплярами программы</li>
          <li>использовать программу online с любой устройства, подключенного к сети</li>
      </ul>
      <p>Если вы забыли пароль, то восстановить его можно <a href="recovery.php?{$sid}" class="btn btn-default" role="button">тут</a></p>
      <h2>Регистрация учётной записи</h2>
      <form method="post" action="join.php?{$sid}">
      <div class="form-group">
        <label for="login">Логин:</label>
        <input type="text" name="login" id="login" class="form-control" placeholder="Логин" required="" 
               autofocus="" value="{if isset($login)}{$login}{/if}">
        <p>Логин должен состоять из английских букв и цифр, быть длинной от 4 до 25 символов и не должен содержать пробела</p>
      </div>
      <div class="form-group">
        <h4>Внимание! Email не проверяется, на указанный email будет выслан пароль.</h4>
        <label for="email1">email:</label>
        <input type="email" name="email1" id="email1" class="form-control" placeholder="email" 
               required="" value="{if isset($email1)}{$email1}{/if}">
      </div>
      <div class="form-group">
        <label for="email2">Повторите email:</label>
        <input type="email" name="email2" class="form-control" placeholder="email" required="" id="email2">
      </div>
        {* enable this to use reCaptcha *}
        {*<div class="g-recaptcha" data-sitekey=""></div>*}
      <button type="submit" name="send" class="btn btn-primary">Зарегистрироваться</button>
    </form>
        {if isset($errors)}<div class="alert alert-warning">
        <h4>Произошли следующие ошибки:</h4>
        <ul>
        {foreach from=$errors item=error}
        <li>{$error}</li>
        {/foreach}
        </ul>
        </div>
        {/if}
</div>
<!-- Bootstrap core JavaScript
================================================== -->
<!-- Placed at the end of the document so the pages load faster -->
<!-- IE10 viewport hack for Surface/desktop Windows 8 bug -->
<script src="js/ie10-viewport-bug-workaround.js"></script>   
{include file='footer_d.tpl'}
