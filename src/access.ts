/**
 * @see https://umijs.org/docs/max/access#access
 * */
export default function access(
  initialState: { currentUser?: API.CurrentUser } | undefined,
) {
  const { currentUser } = initialState ?? {};
  return {
    // 正式环境需要删除此行，恢复为 is_superuser 判断
    canAdmin: !!currentUser,
  };
}
