import { accessByOperation } from './openapi';

export const docsCss = `
  .swagger-ui .topbar { display: none; }
  .swagger-ui { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }

  .swagger-ui .info { margin: 34px 0 26px; }
  .swagger-ui .info .title { font-weight: 700; letter-spacing: -.02em; }
  .swagger-ui .info .title small.version-stamp { background: #c8102e; }
  .swagger-ui .info .base-url { font-size: 13px; color: #667085; }
  .swagger-ui .info table {
    border-collapse: collapse;
    margin: 10px 0 18px;
    font-size: 13.5px;
    width: 100%;
  }
  .swagger-ui .info table th,
  .swagger-ui .info table td {
    border: 1px solid rgba(128, 138, 157, .35);
    padding: 8px 13px;
    text-align: left;
    color: inherit;
    background: transparent;
  }
  .swagger-ui .info table th {
    font-weight: 700;
    font-size: 11.5px;
    letter-spacing: .08em;
    text-transform: uppercase;
    background: rgba(128, 138, 157, .12);
    border-bottom-width: 2px;
  }

  .swagger-ui .scheme-container { box-shadow: none; border-bottom: 1px solid #e4e7ec; background: transparent; padding: 14px 0 18px; }

  .swagger-ui .opblock-tag {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -.01em;
    border-bottom: 1px solid #e4e7ec;
    padding-bottom: 10px;
  }
  .swagger-ui .opblock-tag small { font-weight: 400; color: #667085; }

  .swagger-ui .opblock { border-radius: 10px; margin: 0 0 9px; box-shadow: none; border-width: 1px; }
  .swagger-ui .opblock .opblock-summary { padding: 7px 12px; align-items: center; border-width: 1px; }
  .swagger-ui .opblock .opblock-summary-method {
    min-width: 84px;
    border-radius: 7px;
    font-size: 12.5px;
    font-weight: 700;
    letter-spacing: .05em;
    text-shadow: none;
    box-shadow: none;
  }
  .swagger-ui .opblock .opblock-summary-path { font-size: 14.5px; font-weight: 600; }
  .swagger-ui .opblock .opblock-summary-description {
    font-size: 13.5px;
    color: #667085;
    font-family: inherit;
  }

  .ra-roles {
    display: inline-flex;
    gap: 6px;
    margin-left: auto;
    padding-left: 16px;
    align-items: center;
    flex-shrink: 0;
  }
  .ra-role {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 999px;
    border: 1px solid transparent;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: .07em;
    text-transform: uppercase;
    white-space: nowrap;
    line-height: 1.5;
  }
  .ra-admin { color: #b42318; background: #fef3f2; border-color: #fecdca; }
  .ra-driver { color: #175cd3; background: #eff8ff; border-color: #b2ddff; }
  .ra-patient { color: #067647; background: #ecfdf3; border-color: #abefc6; }
  .ra-auth { color: #6941c6; background: #f9f5ff; border-color: #e9d7fe; }
  .ra-public { color: #475467; background: #f9fafb; border-color: #e4e7ec; }

  @media (max-width: 780px) {
    .ra-roles { display: none; }
  }
`;

const roleClass: Record<string, string> = {
  ADMIN: 'ra-admin',
  DRIVER: 'ra-driver',
  PATIENT: 'ra-patient',
  Authenticated: 'ra-auth',
  Public: 'ra-public',
};

export const buildDocsScript = (): string => {
  const roles = Object.fromEntries(
    Object.entries(accessByOperation).map(([key, value]) => [key, value.roles]),
  );

  return `
(function () {
  var ROLES = ${JSON.stringify(roles)};
  var CLASSES = ${JSON.stringify(roleClass)};

  function decorate() {
    var rows = document.querySelectorAll('.opblock-summary');

    for (var i = 0; i < rows.length; i += 1) {
      var row = rows[i];
      if (row.querySelector('.ra-roles')) continue;

      var method = row.querySelector('.opblock-summary-method');
      var pathEl = row.querySelector('.opblock-summary-path');
      var description = row.querySelector('.opblock-summary-description');
      if (!method || !pathEl || !description) continue;

      var path = pathEl.getAttribute('data-path');
      var value = ROLES[method.textContent.trim().toLowerCase() + ' ' + path];
      if (!value) continue;

      var wrap = document.createElement('span');
      wrap.className = 'ra-roles';

      var names = value.split(',');
      for (var j = 0; j < names.length; j += 1) {
        var name = names[j].trim();
        var pill = document.createElement('span');
        pill.className = 'ra-role ' + (CLASSES[name] || 'ra-auth');
        pill.textContent = name;
        pill.title = 'Allowed role: ' + name;
        wrap.appendChild(pill);
      }

      description.insertAdjacentElement('afterend', wrap);
    }
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(function () {
      scheduled = false;
      decorate();
    });
  }

  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  schedule();
})();
`;
};
