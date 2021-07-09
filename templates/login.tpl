{* Smarty *} 
{include file='header.tpl'}
</head>
<body>

<div data-role="page">
  <div data-role="header">
  <h1>Страница авторизации</h1>
  </div>

  <div data-role="main" class="ui-content">
    <form method="post" action="login.php?{$sid}" data-ajax="false">
      <div class="ui-field-contain">
        <label for="login">Логин:</label>
        <input type="text" name="login" id="login" value="{if isset($login)}{$login}{/if}">       
        <label for="passwd">Пароль:</label>
        <input type="password" name="passwd" id="passwd">
      </div>
      <input type="submit" data-inline="true" value="Вход" data-icon="check" name="send">
    </form>
        {if isset($errors)}
            <a href="recovery.php?{$sid}" data-ajax="false" class="ui-btn ui-btn-inline ui-shadow ui-corner-all ui-icon-action ui-btn-icon-left">Восстановить пароль</a>
            <h4>Произошли следующие ошибки:</h4>
            <ul>
            {foreach from=$errors item=error}
            <li>{$error}</li>
            {/foreach}
            </ul>
        {/if}
        <p>Нет учётной записи - 
            <a href="join.php?{$sid}" data-ajax="false" {*class="ui-btn ui-btn-inline ui-shadow ui-corner-all ui-icon-action ui-btn-icon-left"*}>зарегистриуйтесь!</a></p>
  </div>
  <div data-role="footer">
    <h1>DiaCalc</h1>
  </div>
</div>
{include file='footer.tpl'}