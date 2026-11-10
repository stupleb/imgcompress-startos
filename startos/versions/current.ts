import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.0.0:0',
  releaseNotes: {
    en_US:
      'Updated ImgCompress to 1.0.0, which adds WebP export, an image editor, AI upscaling and conversions that keep running in the background. Uploads are now limited to 1 GB each; Configure Limits raises the limit and sets the number of web workers. Full list of changes: https://github.com/karimz1/imgcompress/releases/tag/release_1.0.0',
    es_ES:
      'ImgCompress actualizado a 1.0.0, que añade exportación a WebP, un editor de imágenes, escalado con IA y conversiones que siguen ejecutándose en segundo plano. Las subidas ahora están limitadas a 1 GB cada una; Configurar límites sube el límite y define el número de workers web. Lista completa de cambios: https://github.com/karimz1/imgcompress/releases/tag/release_1.0.0',
    de_DE:
      'ImgCompress auf 1.0.0 aktualisiert, mit WebP-Export, einem Bildeditor, KI-Hochskalierung und Umwandlungen, die im Hintergrund weiterlaufen. Uploads sind jetzt auf je 1 GB begrenzt; Limits konfigurieren hebt das Limit an und legt die Zahl der Web-Worker fest. Vollständige Liste der Änderungen: https://github.com/karimz1/imgcompress/releases/tag/release_1.0.0',
    pl_PL:
      'Zaktualizowano ImgCompress do 1.0.0, który dodaje eksport do WebP, edytor obrazów, skalowanie z AI i konwersje działające dalej w tle. Przesyłane pliki są teraz ograniczone do 1 GB każdy; Skonfiguruj limity podnosi limit i ustawia liczbę procesów roboczych. Pełna lista zmian: https://github.com/karimz1/imgcompress/releases/tag/release_1.0.0',
    fr_FR:
      "ImgCompress mis à jour vers la version 1.0.0, qui ajoute l'export WebP, un éditeur d'images, l'agrandissement par IA et des conversions qui continuent en arrière-plan. Les envois sont désormais limités à 1 Go chacun ; Configurer les limites relève la limite et fixe le nombre de workers web. Liste complète des changements : https://github.com/karimz1/imgcompress/releases/tag/release_1.0.0",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
