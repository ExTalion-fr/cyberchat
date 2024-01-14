
--
-- Base de données : `cyberchat`
--

CREATE DATABASE IF NOT EXISTS `cyberchat` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `cyberchat`;

-- --------------------------------------------------------

--
-- Structure de la table `user`
--

CREATE TABLE `user` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `username` varchar(255) NOT NULL,
    `email` varchar(255) NOT NULL,
    `password` varchar(255) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
