import "./SortControls.css";

export const DEFAULT_SORT = "ListingContractDate:desc";
const options = [
  [DEFAULT_SORT, "Newest listed"], ["ListingContractDate:asc", "Oldest listed"],
  ["L_SystemPrice:asc", "Price: low to high"], ["L_SystemPrice:desc", "Price: high to low"],
  ["LM_Int2_3:desc", "Square feet: largest"], ["LM_Int2_3:asc", "Square feet: smallest"],
  ["L_Keyword2:desc", "Bedrooms: most"], ["L_Keyword2:asc", "Bedrooms: fewest"],
];
function SortControls({ value, onChange, disabled }) {
  return <div className="sort-controls"><label htmlFor="property-sort">Sort by</label><select id="property-sort" value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>{options.map(([optionValue, label]) => <option value={optionValue} key={optionValue}>{label}</option>)}</select></div>;
}
export default SortControls;
