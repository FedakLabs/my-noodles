переглянути всі декоратори чи вони не якось занадто в тупу, чи є якісь ще утіліті декоратитори і тд що можуть бути винесені як в загальні libs api так і в libs api nest

=====
after nest v12

vitest will be used + ESM

migrate completely to vitest for web and api
migrate completely to esm for web and api

remove completely jest from project
remove completely cjs commonjs etc from a project

=====

Migrate typescript 6 to 7

And also add extension Vs code typescript 7 stove 6 is still default

=====

після міграції на nest v12 можливо можна буде прибрати ці всі проміжні роботи esm -> cjs

types
default

імпорти в package.json і залежності всіх nx monorepo build jobs що потребують raw js при валідації чи роботі тестів кожен раз ребілдити
що все буде вдало працювати і не буде потреби кожен раз ребілдати ts -> js а dev завжди буде добре працювати з ts on the flie transpilation

@libs/api/package.json:15-33 щось типу такого

@libs/locale/package.json:6-18 а все можна буде просто import одразу .ts файли
