{* Smarty *} 
{include file='header.tpl'}
</head>
<body>

<div data-role="page">
  <div data-role="header">
  <h1>Поздравляю!</h1>
  </div>
  <div data-role="main" class="ui-content">
      <p>Вы успешно зарегистрировали учетную запись программы DiaCalc. Параметры учетной записи, в том числе пароль, отправлены на указанный Вами email.</p>
      <p>Теперь самое время начать использовать программу - <a href="login.php?{$sid}" data-ajax="false">online.diacalc.org</a></p>
      <p>Справка по online программе находится тут - <a href="http://help.diacalc.org/" data-ajax="false">Справка по программе</a></p>
  </div>
  <div data-role="footer">
    <h1>DiaCalc</h1>
  </div>
</div>
{include file='footer.tpl'}
