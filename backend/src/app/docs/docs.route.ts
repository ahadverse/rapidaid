import { Request, Response, Router } from 'express';
import swaggerUi, { SwaggerUiOptions } from 'swagger-ui-express';
import { openapiSpec } from './openapi';
import postmanCollection from './postman.json';
import { buildDocsScript, docsCss } from './theme';

type TSetupOptions = SwaggerUiOptions & { customJsStr?: string };

const router = Router();

router.get('/postman', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="RapidAid.postman_collection.json"',
  );
  res.send(JSON.stringify(postmanCollection, null, 2));
});

router.get('/openapi.json', (_req: Request, res: Response) => {
  res.json(openapiSpec);
});

router.use(
  '/',
  swaggerUi.serve,
  swaggerUi.setup(openapiSpec, {
    customSiteTitle: 'RapidAid API Docs',
    customCss: docsCss,
    customJsStr: buildDocsScript(),
    swaggerOptions: { persistAuthorization: true, docExpansion: 'none', filter: true },
  } as TSetupOptions),
);

export const DocsRoutes = router;
