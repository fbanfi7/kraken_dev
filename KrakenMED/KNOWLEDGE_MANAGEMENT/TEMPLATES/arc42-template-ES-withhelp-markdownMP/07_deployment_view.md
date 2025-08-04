Vista de Despliegue {#section-deployment-view}
===================

**Contenido.**

La vista de despliegue describe:

1.  La infraestructura técnica usada para ejecutar el sistema, con
    elementos de infraestructura como locaciones geográficas, ambientes,
    computadoras, procesadores, canales y topologías de red así como
    otros elementos de infraestructura.

2.  El mapeo de los bloques de construcción (software) en dichos
    elementos de infraestructura.

Comúnmente los sistemas son ejecutados en diferentes ambientes, por
ejemplo, ambiente de desarrollo, de pruebas, de producción. En dichos
casos deberían documentarse todos los ambientes relevantes.

Deberá documentarse la vista de despliegue de manera especial cuando el
software se ejecute como un sistema distribuido con mas de una
computadora, procesador, servidor o contenedor o cuando se diseñen los
procesadores y chips de hardware propios.

Desde una perspectiva de software es suficiente con capturar los
elementos de la infraestructura necesarios para mostrar el despliegue de
los bloques de construcción. Los arquitectos de hardware pueden ir más
alla y describir la infraestructura a cualquier nivel de detalle que
requieran.

**Motivación.**

El software no corre sin haardware. El hardware subyacente puede
influenciar el sistema o algunos conceptos entrecruzados. Por ende, es
necesario conocer la infraestructura.

**Forma.**

Quizá el más alto nivel de diagrama de despliegue esté contenido en la
sección 3.2. como contexto técnico con la propia infraestructura como
UNA caja negra. En esta sección se deberá realizar un acercamiento a
ésta caja negra utilizando diagramas de despliegue adicionales:

-   UML provee diagramas de despliegue para expresar la vista. Uselos,
    probablemente con diagramas anidados.

-   Cuando las partes relacionadas de Hardware prefieran otro tipo de
    diagramas además de los diagramas de despliegue, permítales usar
    cualquier tipo que permita mostrar los nodos y canales de la
    infraestructura.

Nivel de infraestructura 1 {#_nivel_de_infraestructura_1}
--------------------------

Describa (Usualmente en una combinación de diagramas, tablas y texto):

-   La distribución del sistema en múltiples ubicaciones, ambientes,
    computadoras, procesadores, ... así como las conexiones físicas
    entre ellos

-   La motivación o justificación de importancia para la estructura de
    despliegue

-   Características de Calidad y/o rendimiento de la infraestructura

-   El mapeo de los artefactos de software a los elementos de la
    infraestructura.

Para múltiples ambientes o despliegues alternativos copie esta sección
para todos los ambientes relevantes.

***\<Diagrama General\>***

Motivación

:   *\<Explicación en forma textual\>*

Características de Calidad/Rendimiento

:   *\<Explicación en forma textual\>*

    Mapeo de los Bloques de Construcción a Infraestructura

    :   *\<Descripción del mapeo\>*

Nivel de Infraestructura 2 {#_nivel_de_infraestructura_2}
--------------------------

Aquí puede incluir la estructura interna de (algunos) elementos de
infraestructura del nivel 1.

Copie la estructura del nivel 1 para cada elemento elegido.

### *\<Elemento de Infraestructura 1\>* {#__emphasis_elemento_de_infraestructura_1_emphasis}

*\<diagrama + explicación\>*

### *\<Elemento de Infraestructura 2\>* {#__emphasis_elemento_de_infraestructura_2_emphasis}

*\<diagrama + explicación\>*

...

### *\<Elemento de Infraestructura n\>* {#__emphasis_elemento_de_infraestructura_n_emphasis}

*\<diagrama + explicación\>*
