CREATE DATABASE IF NOT EXISTS `test`;
GRANT ALL ON test.* TO 'mysql'@'%';
ALTER USER 'mysql'@'%' IDENTIFIED WITH mysql_native_password BY 'password'