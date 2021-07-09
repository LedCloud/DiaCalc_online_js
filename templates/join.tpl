{* Smarty *} 
{include file='header.tpl'}
<script src='https://www.google.com/recaptcha/api.js'></script>
</head>
<body>

<div data-role="page">
  <div data-role="header">
  <h1>Регистрация</h1>
  </div>

  <div data-role="main" class="ui-content">
      <p>На данной странице можно зарегистрировать учетную запись программы DiaCalc, которая позволит:
      <ul>
          <li>сохранять базу продуктов, меню на сервере</li>
          <li>синхронизировать базу продуктов и меню <a href="http://diacalc.org/" data-ajax="false">программы DiaCalcJ</a> между разными экземплярами программы</li>
          <li>использовать программу online с любой устройства, подключенного к сети</li>
      </ul>
      <p>Если вы забыли пароль, то восстановить его можно <a href="recovery.php?{$sid}" data-ajax="false">тут</a></p>
      <h3>Регистрация учётной записи</h3>
    <form method="post" action="join.php?{$sid}" data-ajax="false">
      <div class="ui-field-contain">
        <label for="login">Логин:</label>
        <input type="text" name="login" id="login" value="{if isset($login}{$login}{/if}">
        <p>Логин должен состоять из английских букв и цифр, быть длинной от 4 до 25 символов и не должен содержать пробела</p>
        <h4>Внимание! Email не проверяется, на указанный email будет выслан пароль.</h4>
        <label for="email1">email:</label>
        <input type="email" name="email1" id="email1" value="{if isset($email1)}{$email1}{/if}">
        <label for="email2">Повторите email:</label>
        
        <input type="email" name="email2" id="email2">
        {* enable this to use reCaptcha *}
        {*<div class="g-recaptcha" data-sitekey=""></div>*}
        
      </div>
      <input type="submit" data-inline="true" value="Зарегистрироваться" data-icon="check" name="send">
    </form>
        {if isset($errors)}
        <h4>Произошли следующие ошибки:</h4>
        <ul>
        {foreach from=$errors item=error}
        <li>{$error}</li>
        {/foreach}
        </ul>
        {/if}
  </div>
  <div data-role="footer">
    <h1>DiaCalc</h1>
  </div>
</div>
{include file='footer.tpl'}
