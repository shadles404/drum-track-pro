-- Allow admins to view all user roles (needed for salespeople listing)
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
USING (has_role(auth.uid(), 'admin'));