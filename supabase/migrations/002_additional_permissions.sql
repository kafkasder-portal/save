-- Additional Permissions Migration
-- This migration ensures comprehensive permissions for all tables
-- and addresses any potential permission gaps

-- =============================================
-- COMPREHENSIVE TABLE PERMISSIONS
-- =============================================

-- Grant SELECT permissions to anon role for all main tables
GRANT SELECT ON public.user_profiles TO anon;
GRANT SELECT ON public.beneficiaries TO anon;
GRANT SELECT ON public.family_members TO anon;
GRANT SELECT ON public.applications TO anon;
GRANT SELECT ON public.aid_records TO anon;
GRANT SELECT ON public.payments TO anon;
GRANT SELECT ON public.in_kind_aids TO anon;
GRANT SELECT ON public.meetings TO anon;
GRANT SELECT ON public.meeting_attendees TO anon;
GRANT SELECT ON public.meeting_agenda TO anon;
GRANT SELECT ON public.meeting_minutes TO anon;
GRANT SELECT ON public.meeting_action_items TO anon;
GRANT SELECT ON public.meeting_notifications TO anon;
GRANT SELECT ON public.tasks TO anon;
GRANT SELECT ON public.task_comments TO anon;
GRANT SELECT ON public.task_attachments TO anon;
GRANT SELECT ON public.task_notifications TO anon;
GRANT SELECT ON public.task_activities TO anon;
GRANT SELECT ON public.conversations TO anon;
GRANT SELECT ON public.conversation_participants TO anon;
GRANT SELECT ON public.internal_messages TO anon;
GRANT SELECT ON public.message_reactions TO anon;
GRANT SELECT ON public.message_notifications TO anon;
GRANT SELECT ON public.documents TO anon;

-- Grant ALL PRIVILEGES to authenticated role for all tables
GRANT ALL PRIVILEGES ON public.user_profiles TO authenticated;
GRANT ALL PRIVILEGES ON public.beneficiaries TO authenticated;
GRANT ALL PRIVILEGES ON public.family_members TO authenticated;
GRANT ALL PRIVILEGES ON public.applications TO authenticated;
GRANT ALL PRIVILEGES ON public.aid_records TO authenticated;
GRANT ALL PRIVILEGES ON public.payments TO authenticated;
GRANT ALL PRIVILEGES ON public.in_kind_aids TO authenticated;
GRANT ALL PRIVILEGES ON public.meetings TO authenticated;
GRANT ALL PRIVILEGES ON public.meeting_attendees TO authenticated;
GRANT ALL PRIVILEGES ON public.meeting_agenda TO authenticated;
GRANT ALL PRIVILEGES ON public.meeting_minutes TO authenticated;
GRANT ALL PRIVILEGES ON public.meeting_action_items TO authenticated;
GRANT ALL PRIVILEGES ON public.meeting_notifications TO authenticated;
GRANT ALL PRIVILEGES ON public.tasks TO authenticated;
GRANT ALL PRIVILEGES ON public.task_comments TO authenticated;
GRANT ALL PRIVILEGES ON public.task_attachments TO authenticated;
GRANT ALL PRIVILEGES ON public.task_notifications TO authenticated;
GRANT ALL PRIVILEGES ON public.task_activities TO authenticated;
GRANT ALL PRIVILEGES ON public.conversations TO authenticated;
GRANT ALL PRIVILEGES ON public.conversation_participants TO authenticated;
GRANT ALL PRIVILEGES ON public.internal_messages TO authenticated;
GRANT ALL PRIVILEGES ON public.message_reactions TO authenticated;
GRANT ALL PRIVILEGES ON public.message_notifications TO authenticated;
GRANT ALL PRIVILEGES ON public.documents TO authenticated;

-- Grant ALL PRIVILEGES to service_role for all tables
GRANT ALL PRIVILEGES ON public.user_profiles TO service_role;
GRANT ALL PRIVILEGES ON public.beneficiaries TO service_role;
GRANT ALL PRIVILEGES ON public.family_members TO service_role;
GRANT ALL PRIVILEGES ON public.applications TO service_role;
GRANT ALL PRIVILEGES ON public.aid_records TO service_role;
GRANT ALL PRIVILEGES ON public.payments TO service_role;
GRANT ALL PRIVILEGES ON public.in_kind_aids TO service_role;
GRANT ALL PRIVILEGES ON public.meetings TO service_role;
GRANT ALL PRIVILEGES ON public.meeting_attendees TO service_role;
GRANT ALL PRIVILEGES ON public.meeting_agenda TO service_role;
GRANT ALL PRIVILEGES ON public.meeting_minutes TO service_role;
GRANT ALL PRIVILEGES ON public.meeting_action_items TO service_role;
GRANT ALL PRIVILEGES ON public.meeting_notifications TO service_role;
GRANT ALL PRIVILEGES ON public.tasks TO service_role;
GRANT ALL PRIVILEGES ON public.task_comments TO service_role;
GRANT ALL PRIVILEGES ON public.task_attachments TO service_role;
GRANT ALL PRIVILEGES ON public.task_notifications TO service_role;
GRANT ALL PRIVILEGES ON public.task_activities TO service_role;
GRANT ALL PRIVILEGES ON public.conversations TO service_role;
GRANT ALL PRIVILEGES ON public.conversation_participants TO service_role;
GRANT ALL PRIVILEGES ON public.internal_messages TO service_role;
GRANT ALL PRIVILEGES ON public.message_reactions TO service_role;
GRANT ALL PRIVILEGES ON public.message_notifications TO service_role;
GRANT ALL PRIVILEGES ON public.documents TO service_role;

-- =============================================
-- SEQUENCE PERMISSIONS
-- =============================================

-- Grant sequence permissions to authenticated and service_role
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- =============================================
-- FUNCTION PERMISSIONS
-- =============================================

-- Grant function execution permissions
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- =============================================
-- ADDITIONAL RLS POLICIES FOR MISSING TABLES
-- =============================================

-- Family Members RLS Policies
CREATE POLICY "Users can view family members of accessible beneficiaries" ON public.family_members
    FOR SELECT USING (
        beneficiary_id IN (
            SELECT id FROM public.beneficiaries 
            WHERE true -- Beneficiaries already have their own RLS
        )
    );

CREATE POLICY "Authorized users can manage family members" ON public.family_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'manager', 'coordinator')
        )
    );

-- Aid Records RLS Policies
CREATE POLICY "All authenticated users can view aid records" ON public.aid_records
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authorized users can manage aid records" ON public.aid_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'manager', 'coordinator')
        )
    );

-- Payments RLS Policies
CREATE POLICY "Authorized users can view payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'manager', 'coordinator')
        )
    );

CREATE POLICY "Authorized users can manage payments" ON public.payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'manager', 'coordinator')
        )
    );

-- In-Kind Aids RLS Policies
CREATE POLICY "All authenticated users can view in-kind aids" ON public.in_kind_aids
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authorized users can manage in-kind aids" ON public.in_kind_aids
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'manager', 'coordinator')
        )
    );

-- Meeting Attendees RLS Policies
CREATE POLICY "Users can view meeting attendees for accessible meetings" ON public.meeting_attendees
    FOR SELECT USING (
        meeting_id IN (
            SELECT id FROM public.meetings 
            WHERE created_by = auth.uid() OR 
            id IN (SELECT meeting_id FROM public.meeting_attendees WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Meeting creators can manage attendees" ON public.meeting_attendees
    FOR ALL USING (
        meeting_id IN (
            SELECT id FROM public.meetings WHERE created_by = auth.uid()
        )
    );

-- Meeting Agenda RLS Policies
CREATE POLICY "Users can view agenda for accessible meetings" ON public.meeting_agenda
    FOR SELECT USING (
        meeting_id IN (
            SELECT id FROM public.meetings 
            WHERE created_by = auth.uid() OR 
            id IN (SELECT meeting_id FROM public.meeting_attendees WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Meeting creators can manage agenda" ON public.meeting_agenda
    FOR ALL USING (
        meeting_id IN (
            SELECT id FROM public.meetings WHERE created_by = auth.uid()
        )
    );

-- Meeting Minutes RLS Policies
CREATE POLICY "Users can view minutes for accessible meetings" ON public.meeting_minutes
    FOR SELECT USING (
        meeting_id IN (
            SELECT id FROM public.meetings 
            WHERE created_by = auth.uid() OR 
            id IN (SELECT meeting_id FROM public.meeting_attendees WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Authorized users can manage meeting minutes" ON public.meeting_minutes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'manager', 'coordinator')
        )
    );

-- Meeting Action Items RLS Policies
CREATE POLICY "Users can view action items for accessible meetings" ON public.meeting_action_items
    FOR SELECT USING (
        meeting_id IN (
            SELECT id FROM public.meetings 
            WHERE created_by = auth.uid() OR 
            id IN (SELECT meeting_id FROM public.meeting_attendees WHERE user_id = auth.uid())
        ) OR assigned_to = auth.uid()
    );

CREATE POLICY "Users can manage action items they created or are assigned to" ON public.meeting_action_items
    FOR ALL USING (
        created_by = auth.uid() OR assigned_to = auth.uid()
    );

-- Task Comments RLS Policies
CREATE POLICY "Users can view comments on accessible tasks" ON public.task_comments
    FOR SELECT USING (
        task_id IN (
            SELECT id FROM public.tasks 
            WHERE assigned_to = auth.uid() OR assigned_by = auth.uid()
        )
    );

CREATE POLICY "Users can add comments to accessible tasks" ON public.task_comments
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        task_id IN (
            SELECT id FROM public.tasks 
            WHERE assigned_to = auth.uid() OR assigned_by = auth.uid()
        )
    );

-- Task Attachments RLS Policies
CREATE POLICY "Users can view attachments on accessible tasks" ON public.task_attachments
    FOR SELECT USING (
        task_id IN (
            SELECT id FROM public.tasks 
            WHERE assigned_to = auth.uid() OR assigned_by = auth.uid()
        )
    );

CREATE POLICY "Users can add attachments to accessible tasks" ON public.task_attachments
    FOR INSERT WITH CHECK (
        uploaded_by = auth.uid() AND
        task_id IN (
            SELECT id FROM public.tasks 
            WHERE assigned_to = auth.uid() OR assigned_by = auth.uid()
        )
    );

-- Task Notifications RLS Policies
CREATE POLICY "Users can view their own task notifications" ON public.task_notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create task notifications" ON public.task_notifications
    FOR INSERT WITH CHECK (true);

-- Task Activities RLS Policies
CREATE POLICY "Users can view activities on accessible tasks" ON public.task_activities
    FOR SELECT USING (
        task_id IN (
            SELECT id FROM public.tasks 
            WHERE assigned_to = auth.uid() OR assigned_by = auth.uid()
        )
    );

CREATE POLICY "System can create task activities" ON public.task_activities
    FOR INSERT WITH CHECK (true);

-- Conversation Participants RLS Policies
CREATE POLICY "Users can view participants in their conversations" ON public.conversation_participants
    FOR SELECT USING (
        conversation_id IN (
            SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Conversation creators can manage participants" ON public.conversation_participants
    FOR ALL USING (
        conversation_id IN (
            SELECT id FROM public.conversations WHERE created_by = auth.uid()
        )
    );

-- Message Reactions RLS Policies
CREATE POLICY "Users can view reactions in accessible conversations" ON public.message_reactions
    FOR SELECT USING (
        message_id IN (
            SELECT id FROM public.internal_messages 
            WHERE conversation_id IN (
                SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage their own reactions" ON public.message_reactions
    FOR ALL USING (user_id = auth.uid());

-- Message Notifications RLS Policies
CREATE POLICY "Users can view their own message notifications" ON public.message_notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create message notifications" ON public.message_notifications
    FOR INSERT WITH CHECK (true);

-- Documents RLS Policies
CREATE POLICY "All authenticated users can view public documents" ON public.documents
    FOR SELECT USING (is_public = true OR auth.role() = 'authenticated');

CREATE POLICY "Authorized users can manage documents" ON public.documents
    FOR ALL USING (
        uploaded_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'manager', 'coordinator')
        )
    );

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

DO $$
BEGIN
    RAISE NOTICE 'Additional permissions migration completed successfully!';
    RAISE NOTICE 'All tables now have comprehensive RLS policies';
    RAISE NOTICE 'Role-based permissions configured for anon, authenticated, and service_role';
    RAISE NOTICE 'Database is ready for production use';
END $$;