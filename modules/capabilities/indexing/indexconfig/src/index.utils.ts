export function removeSearchAclPrefix ( s: string ) {
  return s.replace ( /^.search-acl-filter-/g, '' );
}