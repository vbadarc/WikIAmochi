/**
 * kidKnowledgeBase.js - Base de conocimiento pedagógica curada con imágenes oficiales de Vikidia
 */

export const KID_CURATED_ANSWERS = [
    {
        patterns: [
            /^(?:¡?hola!?|hola\s+gloop|buenos\s+d[ií]as|buenas\s+tardes|buenas\s+noches|qu[eé]\s+tal|hey|saludos)(?:\s+gloop|\s+amigo|\s+amiguito)?$/i,
            /^hola$/i,
            /^hola\s+/i
        ],
        title: "¡Hola, amigo!",
        answer: "¡Hola! ¡Qué alegría verte por aquí! Soy Gloop, tu amigo de gelatina saltarina. ¿Qué curiosidad o misterio del mundo quieres que descubramos juntos hoy? ¡Pregúntame sobre el espacio, los dinosaurios, animales o lo que tú quieras!",
        imagePath: null,
        imageCaption: null,
        mood: "happy"
    },
    {
        patterns: [
            /^(?:qui[eé]n\s+eres|c[oó]mo\s+te\s+llamas|qu[eé]\s+eres|cu[aá]l\s+es\s+tu\s+nombre)(?:\s+gloop)?$/i,
            /qui[eé]n\s+es\s+gloop/i
        ],
        title: "Soy Gloop",
        answer: "¡Soy Gloop! Una criatura mágica de gelatina inteligente. Me encanta rebotar por la pantalla, investigar en la gran enciclopedia infantil y ayudarte a descubrir cosas asombrosas del universo. ¡Tócame, hazme cosquillas o pregúntame lo que quieras!",
        imagePath: null,
        imageCaption: null,
        mood: "happy"
    },
    {
        patterns: [
            /^(?:c[oó]mo\s+est[aá]s|qu[eé]\s+tal\s+est[aá]s|est[aá]s\s+bien)(?:\s+gloop)?$/i,
            /c[oó]mo\s+te\s+sientes/i
        ],
        title: "¿Cómo estás?",
        answer: "¡Estoy súper contento y lleno de energía! Mis burbujas de gelatina no paran de saltar de la emoción. ¿Y tú, qué gran aventura quieres explorar conmigo hoy?",
        imagePath: null,
        imageCaption: null,
        mood: "happy"
    },
    {
        patterns: [
            /^(?:muchas\s+)?gracias(?:\s+gloop)?$/i,
            /^(?:eres\s+genial|te\s+quiero|me\s+caes\s+bien|te\s+amo)(?:\s+gloop)?$/i
        ],
        title: "¡De nada, explorador!",
        answer: "¡De nada, amiguito! ¡Tú sí que eres genial y un gran explorador! Me encanta acompañarte y aprender contigo todos los días.",
        imagePath: null,
        imageCaption: null,
        mood: "happy"
    },
    {
        patterns: [
            /^(?:adi[oó]s|hasta\s+luego|chao|hasta\s+ma[nñ]ana|nos\s+vemos)(?:\s+gloop)?$/i
        ],
        title: "¡Hasta luego!",
        answer: "¡Hasta luego, amiguito! Me quedaré descansando y soñando con nuevas aventuras. ¡Vuelve pronto a jugar y aprender!",
        imagePath: null,
        imageCaption: null,
        mood: "sleepy"
    },
    {
        patterns: [
            /cu[aá]ntos a[nñ]os tiene la tierra/i,
            /edad de la tierra/i,
            /cu[aá]ndo naci[oó] la tierra/i,
            /qu[eé] edad tiene el planeta/i
        ],
        title: "La Edad del Planeta Tierra",
        answer: "¡La Tierra tiene aproximadamente cuatro mil quinientos millones de años! Es súper, súper viejita, ¡muchísimo más antigua que los dinosaurios! Pero gracias al agua, al aire y al calor del Sol, sigue llena de vida como un hermoso hogar para todos nosotros.",
        imagePath: "_assets_/0c70a452f799bfe840676ee341124611/Earth_Western_Hemisphere.jpg",
        imageCaption: "Nuestro hermoso planeta Tierra visto desde el espacio",
        mood: "amazed"
    },
    {
        patterns: [
            /por qu[eé] el cielo es azul/i,
            /color del cielo/i,
            /por qu[eé] vemos el cielo azul/i
        ],
        title: "¿Por qué el cielo es azul?",
        answer: "¡Es por la luz del Sol y el aire! La luz del Sol parece blanca, pero en realidad tiene todos los colores del arcoíris. Cuando esa luz choca con los gases de nuestra atmósfera, el color azul viaja en ondas pequeñitas y rebota en todas direcciones, ¡por eso vemos todo el cielo de un azul brillante!",
        imagePath: "_assets_/0c70a452f799bfe840676ee341124611/Celestia_sun.jpg",
        imageCaption: "La brillante luz del Sol ilumina el aire de la Tierra",
        mood: "happy"
    },
    {
        patterns: [
            /por qu[eé] se extinguieron los dinosaurios/i,
            /qu[eé] pas[oó] con los dinosaurios/i,
            /c[oó]mo murieron los dinosaurios/i,
            /dinosauria/i,
            /dinosaurio/i
        ],
        title: "La Gran Aventura de los Dinosaurios",
        answer: "Hace 66 millones de años, un asteroide gigantesco cayó en lo que hoy es México. Levantó tanto polvo que tapó la luz del Sol durante mucho tiempo, hizo mucho frío y las plantas no pudieron crecer. ¡Pero algunos pequeños dinosaurios con plumas sobrevivieron y evolucionaron hasta convertirse en las aves que hoy vemos volar!",
        imagePath: "_assets_/0c70a452f799bfe840676ee341124611/Various_dinosaurs002.jpg",
        imageCaption: "Diferentes tipos de dinosaurios que habitaron la Tierra",
        mood: "curious"
    },
    {
        patterns: [
            /triceratops/i
        ],
        title: "El Fabuloso Triceratops",
        answer: "¡El Triceratops tenía tres cuernos enormes y un escudo en su cabeza para protegerse del feroz Tiranosaurio Rex! Aunque parecía muy fiero con sus cuernos, ¡era un pacífico dinosaurio herbívoro que solo comía plantas y hojas!",
        imagePath: "_assets_/0c70a452f799bfe840676ee341124611/Triceratops_BW.jpg",
        imageCaption: "Ilustración de un Triceratops con sus tres cuernos",
        mood: "amazed"
    },
    {
        patterns: [
            /cu[aá]ntos planetas hay/i,
            /planetas del sistema solar/i,
            /cu[aá]les son los planetas/i,
            /sistema solar/i
        ],
        title: "El Sistema Solar",
        answer: "En nuestro Sistema Solar hay 8 planetas vecinos: Mercurio, Venus, nuestra amada Tierra, Marte el planeta rojo, Júpiter el gigante, Saturno con sus hermosos anillos, Urano y Neptuno. ¡Y también planetitas enanos muy tiernos como Plutón!",
        imagePath: "_assets_/0c70a452f799bfe840676ee341124611/Earth_Western_Hemisphere.jpg",
        imageCaption: "La Tierra y sus planetas vecinos en el Sistema Solar",
        mood: "amazed"
    },
    {
        patterns: [
            /octavo planeta/i,
            /cu[aá]l es el [uú]ltimo planeta/i,
            /planeta n[uú]mero 8/i
        ],
        title: "Neptuno, el Octavo Planeta",
        answer: "¡El octavo planeta de nuestro Sistema Solar es Neptuno! Es el planeta más lejano al Sol, un gigante de hielo de un hermoso color azul brillante con vientos súper veloces y temperaturas muy heladas.",
        imagePath: "_assets_/0c70a452f799bfe840676ee341124611/Earth_Western_Hemisphere.jpg",
        imageCaption: "Neptuno, el octavo planeta del Sistema Solar",
        mood: "amazed"
    },
    {
        patterns: [
            /bandera de jap[oó]n/i,
            /c[oó]mo es la bandera de jap[oó]n/i
        ],
        title: "La Bandera de Japón",
        answer: "¡La bandera de Japón se llama Hinomaru! Es muy bonita y elegante: tiene un fondo blanco con un gran círculo de color rojo brillante justo en el centro, el cual representa al Sol naciente.",
        imagePath: "_assets_/0c70a452f799bfe840676ee341124611/Flag_of_Japan.svg.png",
        imageCaption: "Bandera oficial de Japón (Hinomaru, el Sol naciente)",
        mood: "happy"
    },
    {
        patterns: [
            /bandera de espa[nñ]a/i,
            /c[oó]mo es la bandera de espa[nñ]a/i
        ],
        title: "La Bandera de España",
        answer: "¡La bandera de España se conoce como la Rojigualda! Tiene tres franjas horizontales: dos rojas en los extremos y una amarilla en el centro que es el doble de ancha, decorada con el escudo oficial de España.",
        imagePath: "_assets_/0c70a452f799bfe840676ee341124611/Flag_of_Spain.svg.png",
        imageCaption: "Bandera oficial de España",
        mood: "happy"
    },
    {
        patterns: [
            /bandera de m[eé]xico/i,
            /c[oó]mo es la bandera de m[eé]xico/i
        ],
        title: "La Bandera de México",
        answer: "¡La bandera de México tiene tres hermosos colores: verde de esperanza, blanco de unidad y rojo de alegría! En el centro lleva un águila real sobre un nopal devorando una serpiente, ¡un símbolo legendario fascinante!",
        imagePath: "_assets_/0c70a452f799bfe840676ee341124611/Flag_of_Mexico.svg.png",
        imageCaption: "Bandera oficial de México con el águila real",
        mood: "amazed"
    },
    {
        patterns: [
            /bandera de argentina/i,
            /c[oó]mo es la bandera de argentina/i
        ],
        title: "La Bandera de Argentina",
        answer: "¡La bandera de Argentina tiene los hermosos colores del cielo y las nubes: celeste y blanco! Justo en el centro brilla el Sol de Mayo con una carita dorada y 32 rayos que representan la libertad.",
        imagePath: "_assets_/0c70a452f799bfe840676ee341124611/Flag_of_Argentina.svg.png",
        imageCaption: "Bandera oficial de Argentina con el Sol de Mayo",
        mood: "happy"
    },
    {
        patterns: [
            /bandera de colombia/i,
            /c[oó]mo es la bandera de colombia/i
        ],
        title: "La Bandera de Colombia",
        answer: "¡La bandera de Colombia tiene tres alegres colores: amarillo que representa sus riquezas y el Sol, azul de sus dos océanos y cielo, y rojo por la fuerza y el amor de su gente!",
        imagePath: "_assets_/0c70a452f799bfe840676ee341124611/Flag_of_Colombia.svg.png",
        imageCaption: "Bandera oficial de Colombia",
        mood: "happy"
    },
    {
        patterns: [
            /bandera de chile/i,
            /c[oó]mo es la bandera de chile/i
        ],
        title: "La Bandera de Chile",
        answer: "¡La bandera de Chile se llama la Estrella Solitaria! Tiene dos franjas, azul y blanca arriba con una estrella blanca de cinco puntas, y una franja roja brillante abajo que representa la fuerza y el valor.",
        imagePath: "_assets_/0c70a452f799bfe840676ee341124611/Flag_of_Chile.svg.png",
        imageCaption: "Bandera oficial de Chile",
        mood: "happy"
    },
    {
        patterns: [
            /bandera de per[uú]/i,
            /c[oó]mo es la bandera de per[uú]/i
        ],
        title: "La Bandera del Perú",
        answer: "¡La bandera del Perú tiene tres franjas verticales: dos rojas en los laterales y una blanca en el centro! Representa la paz, la pureza y el corazón de su gran historia andina.",
        imagePath: "_assets_/0c70a452f799bfe840676ee341124611/War_flag_of_Peru.svg.png",
        imageCaption: "Bandera oficial del Perú",
        mood: "happy"
    },
    {
        patterns: [
            /bandera de francia/i,
            /c[oó]mo es la bandera de francia/i
        ],
        title: "La Bandera de Francia",
        answer: "¡La bandera de Francia es la famosa Tricolor! Está formada por tres franjas verticales iguales de color azul, blanco y rojo, que representan la libertad, la igualdad y la fraternidad entre amigos.",
        imagePath: "_assets_/0c70a452f799bfe840676ee341124611/Flag_of_France.svg.png",
        imageCaption: "Bandera oficial de Francia",
        mood: "happy"
    },
    {
        patterns: [
            /bandera de italia/i,
            /c[oó]mo es la bandera de italia/i
        ],
        title: "La Bandera de Italia",
        answer: "¡La bandera de Italia tiene tres franjas verticales: verde como sus hermosos campos, blanco como la nieve de los Alpes y rojo por el entusiasmo de su gente!",
        imagePath: "_assets_/0c70a452f799bfe840676ee341124611/Flag_of_Italy.svg.png",
        imageCaption: "Bandera oficial de Italia",
        mood: "happy"
    },
    {
        patterns: [
            /bandera de brasil/i,
            /c[oó]mo es la bandera de brasil/i
        ],
        title: "La Bandera de Brasil",
        answer: "¡La bandera de Brasil es una de las más vistosas del mundo! Tiene fondo verde de la selva amazónica, un gran rombo amarillo de su alegría y un círculo azul con constelaciones de estrellas que representan sus estados.",
        imagePath: "_assets_/0c70a452f799bfe840676ee341124611/Flag_of_Brazil.svg.png",
        imageCaption: "Bandera oficial de Brasil",
        mood: "amazed"
    },
    {
        patterns: [
            /bandera de estados unidos/i,
            /bandera de eeuu/i,
            /c[oó]mo es la bandera de estados unidos/i
        ],
        title: "La Bandera de Estados Unidos",
        answer: "¡La bandera de Estados Unidos tiene 50 estrellas blancas que representan sus 50 estados, y 13 franjas rojas y blancas por sus primeras colonias! Se la conoce con cariño como las Barras y Estrellas.",
        imagePath: "_assets_/0c70a452f799bfe840676ee341124611/Flag_of_the_United_States.svg.png",
        imageCaption: "Bandera oficial de Estados Unidos",
        mood: "happy"
    },
    {
        patterns: [
            /todas las banderas/i,
            /banderas del mundo/i,
            /ver banderas/i
        ],
        title: "Las Banderas del Mundo",
        answer: "¡En nuestro planeta hay casi 200 países y cada uno tiene su propia bandera llena de color e historia! Pregúntame por la bandera de cualquier país (como Japón, España, México, Argentina, Francia, Colombia, Chile, Perú o Brasil) y te mostraré su bandera oficial.",
        imagePath: "_assets_/0c70a452f799bfe840676ee341124611/Flag_of_Spain.svg.png",
        imageCaption: "Banderas que representan a los países del mundo",
        mood: "curious"
    },
    {
        patterns: [
            /por qu[eé] brillan las estrellas/i,
            /qu[eé] son las estrellas/i
        ],
        title: "El Brillo de las Estrellas",
        answer: "¡Las estrellas son como gigantescas fogatas en el espacio! Son enormes esferas de gas muy caliente que producen su propia luz y energía, igual que nuestro amigo el Sol. ¡Están tan lejos que de noche las vemos titilar como lucecitas mágicas!",
        imagePath: "_assets_/0c70a452f799bfe840676ee341124611/Celestia_sun.jpg",
        imageCaption: "El Sol es la estrella más cercana a nosotros",
        mood: "happy"
    }
];

export function findCuratedAnswer(query) {
    const clean = query.trim();
    for (const item of KID_CURATED_ANSWERS) {
        for (const pattern of item.patterns) {
            if (pattern.test(clean)) {
                return item;
            }
        }
    }
    return null;
}
