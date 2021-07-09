{* Smarty *} 
{include file='header.tpl'}
</head>
<body>

<div data-role="page">
  <div data-role="header">
  <h1>Смена пароля</h1>
  </div>

  <div data-role="main" class="ui-content">
      {if isset($success)}
          <h3>Пароль успешно изменен</h3><p>Пользователи на всех других устройствах будут разлогинены</p>
              <a href="index.php?{$sid}" data-ajax="false" class="ui-btn ui-shadow ui-corner-all ui-icon-home ui-btn-icon-left">Вернуться</a>
          {else}
            <form method="post" action="changepass.php?{$sid}" data-ajax="false">
                <div class="ui-field-contain">
                    {if isset($message)}<p>{$message}</p>{/if}
                    <label for="old_passwd">Старый пароль:</label>
                    <input type="password" name="old_pass" id="old_pass">
                    <label for="passwd1">Новый пароль:</label>
                    <input type="password" name="passwd1" id="passwd1">
                    <label for="passwd2">Повторите новый пароль:</label>
                    <input type="password" name="passwd2" id="passwd2">
                </div>
                <input type="submit" data-inline="true" data-icon="check" value="Изменить" name="send">
                <a href="index.php?{$sid}" data-ajax="false" class="ui-btn ui-btn-inline ui-shadow ui-corner-all ui-icon-back ui-btn-icon-left">Отмена</a>
            </form>
            {if isset($errors)}<div class="alert alert-warning">
                <h5>Произошли следующие ошибки:</h5>
                <ul>
                {foreach from=$errors item=error}
                <li>{$error}</li>
                {/foreach}
                </ul>
                </div>
            {/if}
          {/if}
          
  </div>
  <div data-role="footer">
    <h1>DiaCalc</h1>
  </div>
</div>
{include file='footer.tpl'}
