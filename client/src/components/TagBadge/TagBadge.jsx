import './TagBadge.css';

const getTagColor = (name) => {
  const normalized = name.toLowerCase();
  if (['warm', 'hot', 'interested'].includes(normalized)) return 'tag-success';
  if (['cold', 'unresponsive'].includes(normalized)) return 'tag-danger';
  if (['follow-up', 'in progress'].includes(normalized)) return 'tag-warning';
  return 'tag-default';
};

const TagBadge = ({ name, onRemove }) => {
  const colorClass = getTagColor(name);
  
  return (
    <span className={`tag-badge ${colorClass}`}>
      {name}
      {onRemove && (
        <button className="tag-remove" onClick={() => onRemove(name)}>
          &times;
        </button>
      )}
    </span>
  );
};

export default TagBadge;
