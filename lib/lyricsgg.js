import axios from 'axios';
import cheerio from 'cheerio';

// Clase de error personalizado para búsqueda de canciones
class ErrorBuscarCancion extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = '[Error de busqueda]';
  }
}

/**
 * Busca la letra de una canción y extrae información relevante.
 * @param {String} cancion - El título de la canción.
 * @returns {Object} - Un objeto con datos sobre la canción, incluyendo letra, artista, álbum, fecha de lanzamiento, géneros, plataformas y otros detalles.
 * @throws {ErrorBuscarCancion} - Si no se encuentra la canción.
 */
async function BuscarLetra(cancion) {
  try {
    // Construir URL de búsqueda en Google
    const URLdeBusqueda = `https://www.google.com/search?q=${encodeURIComponent(cancion + ' song lyrics')}`;
    
    // Realizar solicitud GET con manejo de errores y tiempos de espera
    const { data } = await axios.get(URLdeBusqueda, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
      },
      timeout: 5000, // Añadir un tiempo de espera para la solicitud
    });
    
    // Cargar HTML en cheerio
    const $ = cheerio.load(data);

    // Extraer letras de la canción
    const lineas = $('div[jsname="WbKHeb"] span')
      .map((i, el) => $(el).text())
      .get();

    // Comprobar si se encontró alguna letra
    if (lineas.length > 0) {
      // Extraer información adicional con validaciones
      let artistag = $('div.rVusze span:contains("Artista") + span a').text() || 'Desconocido';
      let albumg = $('div[data-attrid="kc:/music/recording_cluster:first album"] a').text() || 'Desconocido';
      let fechag = $('div.rVusze span:contains("Fecha de lanzamiento") + span span').text() || 'Desconocida';
      let generosg = $('div.rVusze span')
        .filter((i, el) => /Género|Géneros/.test($(el).text()))
        .next('span')
        .find('a')
        .map((i, el) => $(el).text())
        .get();

      if (generosg.length === 0) {
        generosg = 'No definido';
      }

      // Extraer plataformas para escuchar
      let plataformas = [];
      $('.PZPZlf.P8aK7e.Cdj8sf.tpa-ci').each(function () {
        const platformanombre = $(this).find('.i3LlFf').text() || 'Desconocida';
        const platformaLink = $(this).find('a.JkUS4b.brKmxb').attr('href') || '#';
        plataformas.push({
          nombre: platformanombre,
          link: platformaLink,
        });
      });

      // Extraer otros detalles relacionados
      const otros = [];
      let contador = 0;
      $('div[data-md="277"] a').each(function () {
        if (contador < 3) {
          let titulog = $(this).find('.f3LoEf.OSrXXb').text().replace('Letras de ', '') || 'Desconocido';
          const artistagg = $(this).find('.XaIwc.ApHyTb.OSrXXb.C5w57c').text() || 'Desconocido';
          otros.push({
            titulo: titulog,
            artista: artistagg,
          });
          contador++;
        }
      });

      // Construir objeto de datos de la canción
      const CancionData = {
        titulo: cancion,
        artista: artistag,
        album: albumg,
        fecha: fechag,
        generos: generosg,
        escuchar: plataformas,
        otros,
        letra: [lineas.join('\n')],
      };

      return CancionData;
    } else {
      throw new ErrorBuscarCancion(`No se encontró la canción "${cancion}"`);
    }
  } catch (error) {
    // Lanzar error con mensaje específico y manejable
    throw new ErrorBuscarCancion(`Error al buscar la canción "${cancion}": ${error.message}`);
  }
}

export default BuscarLetra;

