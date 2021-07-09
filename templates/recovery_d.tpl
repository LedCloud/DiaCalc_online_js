{* Smarty *} 
{include file='header_d.tpl'}
<link rel="stylesheet" type="text/css" href="css/login.css" />
</head>
<body>
<div class="container">
        {if isset($success)}
            <div class="form-signin alert alert-success">
                <h3>Новый пароль был выслан вам на почту</h3>
                <a href="index.php?{$sid}">Вернуться</a>
            </div>
        {else}
        <form method="post" action="recovery.php?{$sid}" class="form-signin">
            <h3 class="form-signin-heading">Восстановление пароля</h3>
            
            <label for="login" class="sr-only">Логин:</label>
            <input type="text" class="form-control" name="login" id="login" placeholder="Логин" 
                   required="" autofocus="" value="{if isset($login)}{$login}{/if}">
            
            <label for="email" class="sr-only">Почта:</label>
            <input type="email" class="form-control" name="mail" id="mail"placeholder="email" required="">
            
            <button type="submit" name="send" class="btn btn-lg btn-primary btn-block">Отправить</button>
            <a href="index.php?{$sid}" class="btn btn-lg btn-default btn-block" role="button">Отмена</a>
            {if isset($errors)}<div class="alert alert-warning">
                <h4>Произошли следующие ошибки:</h4>
                <ul>
                {foreach from=$errors item=error}
                <li>{$error}</li>
                {/foreach}
                </ul>
                </div>
            {/if}
        </form>
        {/if}
  </div>
<!-- Bootstrap core JavaScript
================================================== -->
<!-- Placed at the end of the document so the pages load faster -->
<!-- IE10 viewport hack for Surface/desktop Windows 8 bug -->
<script src="js/ie10-viewport-bug-workaround.js"></script>
{include file='footer_d.tpl'}
