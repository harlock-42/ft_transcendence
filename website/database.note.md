Les types de donnees

Numeriques

INT -> Nombre entiers

NUMERIC(P,S) -> nombre flotant
P-> width
S-> precision

SERIAL -> INT qui s'incremente de 1. Sert pour les ID

STRING

CHAR(N) -> string avec un nombre (N) predetermine de char

VARCHAR(N) -> string avec un nombre (N) max de char

TEXT -> string de n'importe quel taille

DATE

TIME -> HH:MM:SS -> donne un horaie

DATE -> AAAA-MM-JJ -> donne une date

TIMESTAMP -> AAAA-MM-JJ HH:MM:SS -> donne une date et un horaire

OTHERS

BOOLEAN

ENUM -> liste de valeurs definit par le client

Contraintes

unic : s assure qu il n y ait pas de doublon de valeur dans une colonne

Check : verifie que les valeurs soient superieurs a 0