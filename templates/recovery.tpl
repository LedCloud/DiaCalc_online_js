{* Smarty *} 
{include file='header.tpl'}
</head>
<body>


<div data-role="page">
  <div data-role="header">
  <h1>Восстановление пароля</h1>
  </div>

  <div data-role="main" class="ui-content">
        {if $success}
            <h3>Новый пароль был выслан вам на почту</h3>
            <a href="index.php?{$sid}" data-ajax="false" class="ui-btn ui-shadow ui-corner-all ui-icon-home ui-btn-icon-left">Вернуться</a>
        {else}
        <form method="post" action="" data-ajax="false">
            <div class="ui-field-contain">
                <label for="login">Логин:</label>
                <input type="text" name="login" id="login" value="{if isset($login)}{$login}{/if}">
                <label for="email">Почта:</label>
                <input type="email" name="mail" id="mail">
            </div>
            <input type="submit" data-inline="true" data-icon="check" value="Отправить" name="send">
            <a href="index.php?{$sid}" data-ajax="false" class="ui-btn ui-btn-inline ui-shadow ui-corner-all ui-icon-back ui-btn-icon-left">Отмена</a>
        </form>
            {if isset($errors)}
                <h4>Произошли следующие ошибки:</h4>
                <ul>
                {foreach from=$errors item=error}
                <li>{$error}</li>
                {/foreach}
                </ul>
            {/if}
        {/if}
  </div>
  <div data-role="footer">
    <h1>DiaCalc</h1>
  </div>
</div>
{include file='footer.tpl'}
