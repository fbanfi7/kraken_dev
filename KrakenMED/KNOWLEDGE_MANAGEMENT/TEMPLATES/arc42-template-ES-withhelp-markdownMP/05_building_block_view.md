Vista de Bloques {#section-building-block-view}
================

**Contenido.**

La vista de bloques muestra la descomposición estática del sistema en
bloques de construcción (módulos, componentes, subsistemas, clases,
interfases, paquetes, bibliotecas, marcos de desarrollo, capas,
particiones, funciones, macros, operaciones, estructuras de datos,...)
así como sus dependencias (relaciones, asociaciones,...)

Esta vista es obligatoria para cualquier documentación de arquitectura.
Es la analogía al plano de una casa.

**Motivación.**

Mantener una visión general de su código fuente haciendo su estructura
comprensible de manera abstracta.

Esto permite comunicar a las partes interesades en un nivel abstracto
sin entrar en detalles de implementación.

**Forma.**

La vista de bloques comprende una colección jerárquica de cajas negras y
cajas blancas (ver figura de abajo) y sus descripciones.

![Jerarquía de bloques de
construcción](images/05_building_blocks-ES.png)

**Nivel 1** comprende la descripción de Caja Blanca del sistema en
general junto con las descripciones de Caja Negra de todos los bloques
contenidos.

**Nivel 2** hace zoom a los bloques de construcción del Nivel 1.
Entonces contiene la descripción de Caja Blanca de los bloques de
construcción selecionadas del nivel 1,junto con las descripciones de
caja negra de sus bloques de construcción internas.

**Nivel 3** Hace zoom a los bloques selectos del nivel 2, y así
sucesivamente.

Sistema General de Caja Blanca {#_sistema_general_de_caja_blanca}
------------------------------

Aquí se describe la descomposición del sistema en general usando la
siguiente plantilla de caja blanca. Contiene:

-   Un diagrama general

-   La motivación para la descomposición

-   Descripciones de caja negra de los bloques de construcción
    contenidos. Para estos se ofrecen las siguientes alternativas:

    -   Usar *una* tabla para una revisión pragmática y corta de todos
        los bloques de construcción contenidos y sus interfaces

    -   Usar una lista de descripciones de caja negra de los bloques de
        construcción acorde a la plantilla de caja negra (ver abajo).
        Dependiendo de la herramienta utilizada, esta lista podría
        constar de sub-capítulos (en archivos de texto), sub-páginas (en
        un wiki) o elementos anidados (en una herramienta de modelado).

-   (opcional:) Interfases importantes, que no están explicadas en las
    plantillas de caja negra de un bloque de construcción, pero que son
    muy importantes para entender la caja blanca. En el peor de los
    casos se deberá especificar y desribir la sintaxis, semántica,
    protocolos, manejo de errores, restricciones, versiones, calidades,
    compatibilidades necesarias, entre otras. En el mejor de los casos
    bastará con ejemplos o la firma de los mismos.

***\<Diagrama general\>***

Motivación

:   *\<Explicación en texto\>*

Bloques de construcción contenidos

:   *\<Desripción de los bloques de construcción contenidos (Cajas
    negras)\>*

Interfases importantes

:   *\<Descripción de las interfases importantes\>*

Inserte las explicaciones de las cajas negras del nivel 1:

Si usa la forma tabular solo describa las cajas negras con nombre y
responsabilidad acorde al siguiente esquema:

+-----------------------+-----------------------------------------------+
| **Nombre**            | **Responsabilidad**                           |
+=======================+===============================================+
| *\<caja negra 1\>*    |  *\<Texto\>*                                  |
+-----------------------+-----------------------------------------------+
| *\<caja negra 2\>*    |  *\<Texto\>*                                  |
+-----------------------+-----------------------------------------------+

Si utiliza una lista de descripciones de cajas negras entonces llene una
plantilla de caja negra por cada bloque de construcción importante. El
título es el nombre de la caja negra.

### \<Caja Negra 1\> {#__caja_negra_1}

Aqui se describe la \<caja negra 1\> acorde a la siguiente plantilla:

-   Propósito/Responsabilidad

-   Interfases, cuando no son extraídas como párrafos separados. Estas
    interfases pueden incluir características de calidad y rendimiento.

-   (Opcional) Características de Calidad / Rendimiento de la caja
    negra, por ejemplo, disponibilidad, comportamiento en ejecución, ...

-   (Opcional) Ubicación archivo/directorio

-   (Opcional) Requerimientos satisfechos (si se necesita contar con la
    trazabilidad a los requerimientos).

-   (Opcional) Incidentes/problemas/riesgos abiertos

*\<Propósito/Responsabilidad\>*

*\<Interfase(s)\>*

*\<(Opcional) Características de Calidad/Performance\>*

*\<(Opcional) Ubicación Archivo/Directorio\>*

*\<(Opcional) Requerimientos Satisfechos\>*

*\<(Opcional) Riesgos/Problemas/Incidentes Abiertos\>*

### \<Caja Negra 2\> {#__caja_negra_2}

*\<plantilla de caja negra\>*

### \<Caja Negra N\> {#__caja_negra_n}

*\<Plantilla de caja negra\>*

### \<Interfase 1\> {#__interfase_1}

...

### \<Interfase m\> {#__interfase_m}

Nivel 2 {#_nivel_2}
-------

Aquí se especifica la estructura interna de (algunos) bloques de
construcción del nivel 1 como cajas blancas.

Debe decidir cuales bloques de construcción del sistema son lo
suficientemente importantes para justificar una descripción detallada.
Prefiera la relevancia sobre la completitud. Especifique bloques de
construcción importantes, sorprendentes, riesgosos, complejos o
volátiles. Deje fuera las partes normales, simples, estándares o
aburridas del sistema.

### Caja Blanca *\<bloque de construcción 1\>* {#_caja_blanca_emphasis_bloque_de_construcci_n_1_emphasis}

...Describe la estructura interna de *bloque de construcción 1*.

*\<plantilla de caja blanca\>*

### Caja Blanca *\<bloque de construcción 2\>* {#_caja_blanca_emphasis_bloque_de_construcci_n_2_emphasis}

*\<plantilla de caja blanca\>*

...

### Caja Blanca *\<bloque de construcción m\>* {#_caja_blanca_emphasis_bloque_de_construcci_n_m_emphasis}

*\<plantilla de caja blanca\>*

Nivel 3 {#_nivel_3}
-------

Aqui se especifica la estructura interna de (algunos) de los bloques de
construcción del nivel 2 como cajas blancas.

Cuando la arquitectura requiera más niveles detallados copiar esta
sección para niveles adicionales.

### Caja Blanca \<\_bloque de construcción x.1\_\> {#_caja_blanca_bloque_de_construcci_n_x_1}

Especifica la estructura interna de *bloque de construcción x.1*.

*\<plantilla de caja blanca\>*

### Caja Blanca \<\_bloque de construcción x.2\_\> {#_caja_blanca_bloque_de_construcci_n_x_2}

*\<plantilla de caja blanca\>*

### Caja Blanca \<\_bloque de construcción y.1\_\> {#_caja_blanca_bloque_de_construcci_n_y_1}

*\<plantilla de caja blanca\>*
