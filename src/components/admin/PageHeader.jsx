// One header for every admin page: gold section eyebrow, title (+ optional
// count badge), one-line description, and the page's actions on the right.
export default function PageHeader({ eyebrow, title, badge, description, actions }) {
  return (
    <div className="admin-header">
      <div>
        {eyebrow && <p className="admin-eyebrow">{eyebrow}</p>}
        <h1 className="text-balance">{title}{badge}</h1>
        {description && <p className="admin-header-desc text-pretty">{description}</p>}
      </div>
      {actions && <div className="admin-header-actions">{actions}</div>}
    </div>
  );
}
