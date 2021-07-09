ALTER TABLE `settings` 
ADD `calorlimit` INT UNSIGNED NOT NULL DEFAULT '2000' AFTER `timedcoefs`, 
ADD `shlow` FLOAT NOT NULL DEFAULT '3.2' AFTER `calorlimit`, 
ADD `shhigh` FLOAT NOT NULL DEFAULT '8.0' AFTER `shlow`,
ADD `period` INT NOT NULL DEFAULT '7' AFTER `shhigh`;
