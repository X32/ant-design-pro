/**
 * @see https://umijs.org/docs/max/access#access
 * */
export default function access(
  initialState: { currentUser?: API.CurrentUser } | undefined,
) {
  const { currentUser } = initialState ?? {};
  return {
    canAdmin: currentUser && currentUser.access === 'admin',
    // 临时开发：允许所有登录用户访问（正式环境需要删除此行）
    // canAdmin: !!currentUser,
  };
}
