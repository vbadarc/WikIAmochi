/**
 * kidKnowledgeBase.js - Base de conocimiento pedagógica curada con imágenes oficiales de Vikidia
 */

export const KID_CURATED_ANSWERS = [
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
        imagePath: "_assets_/0c70a452f799bfe840676ee341124611/Earth_Western_Hemisphere.jpg",
        imageCaption: "La bandera de Japón con el círculo rojo del Sol",
        mood: "happy"
    },
    {
        patterns: [
            /todas las banderas/i,
            /banderas del mundo/i,
            /ver banderas/i
        ],
        title: "Las Banderas del Mundo",
        answer: "¡Las banderas son símbolos coloridos y mágicos que representan a cada país y a su gente! Cada bandera tiene colores, estrellas o escudos con historias únicas. ¡Dime el nombre de cualquier país y te contaré cómo es su bandera!",
        imagePath: "_assets_/0c70a452f799bfe840676ee341124611/Earth_Western_Hemisphere.jpg",
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
