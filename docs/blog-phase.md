# Fase Blog Markdown — archivo histórico

Este documento ya no describe el estado operativo vigente. La fase quedó integrada y validada en Preview y Production, incluida la invalidación explícita del caché al crear, publicar, actualizar, despublicar, cambiar slug y eliminar Posts.

La fuente actual para operar el Blog, sus migraciones y su caché es [Arquitectura, configuración y operación](operations.md#11-blog).

Decisión conservada: con Cache Components/PPR y streaming, `notFound()` puede renderizar la UI 404 y `noindex` manteniendo HTTP 200 cuando las cabeceras ya fueron enviadas. Este comportamiento fue evaluado y aceptado; no es una deuda pendiente.
