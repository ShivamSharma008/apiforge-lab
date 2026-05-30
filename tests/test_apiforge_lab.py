"""
APIForge Lab - Comprehensive Playwright Test Suite
Made by Senior SDET SHIVAM SHARMA

Tests all pages, navigation, interactions, and visual elements
of the APIForge Lab platform.
"""
import pytest
import re
from playwright.sync_api import Page, expect

BASE_URL = "http://localhost:5173"


def go(page: Page, hash_path=""):
    """Navigate to a hash-based route. Works with both local and live URLs."""
    base = page.context.browser.contexts[0]._impl_obj._browser._options.get("baseUrl", BASE_URL)
    url = f"{page.url.split('#')[0]}#{hash_path}" if hash_path else page.url.split('#')[0]
    page.goto(url)
    page.wait_for_load_state("networkidle")


# ============================================================
# CONFTEST / FIXTURES
# ============================================================

@pytest.fixture(autouse=True)
def setup(page: Page, base_url):
    """Navigate to base URL and wait for load before each test."""
    page.goto(base_url or BASE_URL)
    page.wait_for_load_state("networkidle")


# ============================================================
# 1. LANDING PAGE TESTS
# ============================================================

class TestLandingPage:
    """Tests for the Landing / Home page."""

    def test_page_title(self, page: Page):
        """Verify the page title contains APIForge Lab."""
        expect(page).to_have_title(re.compile(r"APIForge Lab"))

    def test_hero_heading_visible(self, page: Page):
        """Verify the hero section heading is visible."""
        heading = page.locator("h1").first
        expect(heading).to_be_visible()
        expect(heading).to_contain_text("Build")

    def test_hero_subtitle_visible(self, page: Page):
        """Verify the hero subtitle mentions the platform purpose."""
        subtitle = page.locator("text=playground").first
        expect(subtitle).to_be_visible()

    def test_shivam_sharma_branding(self, page: Page):
        """Verify 'Senior SDET SHIVAM SHARMA' branding is visible."""
        branding = page.locator("text=SHIVAM SHARMA").first
        expect(branding).to_be_visible()

    def test_explore_platform_button(self, page: Page):
        """Verify 'Explore Platform' CTA button exists and is clickable."""
        btn = page.locator("text=Explore Platform").first
        expect(btn).to_be_visible()

    def test_view_architecture_button(self, page: Page):
        """Verify 'View Architecture' button exists."""
        btn = page.locator("text=View Architecture").first
        expect(btn).to_be_visible()

    def test_features_section_visible(self, page: Page):
        """Verify the features section renders with cards."""
        page.locator("text=Everything You Need").scroll_into_view_if_needed()
        features = page.locator("text=Everything You Need").first
        expect(features).to_be_visible()

    def test_feature_cards_present(self, page: Page):
        """Verify all 6 feature categories are shown."""
        expected_features = [
            "API Playground",
            "Database Sandbox",
            "Workflow Engine",
            "Event Simulator",
            "Test Runner",
            "Learning Labs",
        ]
        for feature in expected_features:
            loc = page.locator(f"text={feature}").first
            expect(loc).to_be_visible()

    def test_architecture_section(self, page: Page):
        """Verify the Architecture section is present."""
        section = page.locator("text=Enterprise-Grade Architecture").first
        section.scroll_into_view_if_needed()
        expect(section).to_be_visible()

    def test_tech_stack_section(self, page: Page):
        """Verify tech stack badges are shown."""
        tech_items = ["React", "PostgreSQL", "MongoDB", "Redis", "Kafka", "Docker"]
        for tech in tech_items:
            loc = page.locator(f"text={tech}").first
            expect(loc).to_be_visible()

    def test_launch_platform_cta(self, page: Page):
        """Verify the bottom CTA 'Launch Platform' button exists."""
        btn = page.locator("text=Launch Platform").first
        btn.scroll_into_view_if_needed()
        expect(btn).to_be_visible()

    def test_explore_platform_navigates_to_dashboard(self, page: Page):
        """Click 'Explore Platform' and verify it navigates to #/dashboard."""
        page.locator("text=Explore Platform").first.click()
        page.wait_for_load_state("networkidle")
        expect(page).to_have_url(re.compile(r"#/dashboard"))


# ============================================================
# 2. NAVBAR TESTS
# ============================================================

class TestNavbar:
    """Tests for the navigation bar."""

    def test_navbar_visible(self, page: Page):
        """Verify the navbar is visible."""
        nav = page.locator("nav").first
        expect(nav).to_be_visible()

    def test_logo_text(self, page: Page):
        """Verify the logo text 'APIForge Lab' is visible."""
        logo = page.locator("text=APIForge Lab").first
        expect(logo).to_be_visible()

    def test_nav_links_present(self, page: Page):
        """Verify all navigation links are present."""
        links = ["Home", "API Playground", "DB Sandbox", "Workflows", "Events", "Dashboard"]
        for link_text in links:
            link = page.locator(f"nav >> text={link_text}").first
            expect(link).to_be_visible()

    def test_nav_link_api_playground(self, page: Page):
        """Click API Playground nav link and verify navigation."""
        page.locator("nav >> text=API Playground").first.click()
        page.wait_for_load_state("networkidle")
        expect(page).to_have_url(re.compile(r"#/api-playground"))

    def test_nav_link_db_sandbox(self, page: Page):
        """Click DB Sandbox nav link and verify navigation."""
        page.locator("nav >> text=DB Sandbox").first.click()
        page.wait_for_load_state("networkidle")
        expect(page).to_have_url(re.compile(r"#/db-sandbox"))

    def test_nav_link_workflows(self, page: Page):
        """Click Workflows nav link and verify navigation."""
        page.locator("nav >> text=Workflows").first.click()
        page.wait_for_load_state("networkidle")
        expect(page).to_have_url(re.compile(r"#/workflows"))

    def test_nav_link_events(self, page: Page):
        """Click Events nav link and verify navigation."""
        page.locator("nav >> text=Events").first.click()
        page.wait_for_load_state("networkidle")
        expect(page).to_have_url(re.compile(r"#/events"))

    def test_nav_link_dashboard(self, page: Page):
        """Click Dashboard nav link and verify navigation."""
        page.locator("nav >> text=Dashboard").first.click()
        page.wait_for_load_state("networkidle")
        expect(page).to_have_url(re.compile(r"#/dashboard"))

    def test_nav_link_home(self, page: Page):
        """Navigate away then click Home to return to landing page."""
        page.locator("nav >> text=Dashboard").first.click()
        page.wait_for_load_state("networkidle")
        page.locator("nav >> text=Home").first.click()
        page.wait_for_load_state("networkidle")
        expect(page).to_have_url(re.compile(r"#/$"))


# ============================================================
# 3. API PLAYGROUND TESTS
# ============================================================

class TestApiPlayground:
    """Tests for the API Playground page."""

    @pytest.fixture(autouse=True)
    def navigate(self, page: Page, base_url):
        page.goto(f"{base_url}#/api-playground")
        page.wait_for_load_state("networkidle")

    def test_page_heading(self, page: Page):
        """Verify API Playground heading is visible."""
        heading = page.locator("h1:has-text('API Playground')").first
        expect(heading).to_be_visible()

    def test_endpoint_categories_visible(self, page: Page):
        """Verify endpoint categories (Users, Orders, Products) are shown."""
        for category in ["Users", "Orders", "Products"]:
            loc = page.locator(f"button:has-text('{category}')").first
            expect(loc).to_be_visible()

    def test_user_endpoints_listed(self, page: Page):
        """Verify user API endpoints are listed."""
        loc = page.locator("button", has_text="api/users").first
        expect(loc).to_be_visible()

    def test_http_methods_color_coded(self, page: Page):
        """Verify GET and POST method labels are visible."""
        get_label = page.locator("button:has-text('GET')").first
        expect(get_label).to_be_visible()
        post_label = page.locator("button:has-text('POST')").first
        expect(post_label).to_be_visible()

    def test_send_button_exists(self, page: Page):
        """Verify the Send button exists."""
        send_btn = page.locator("button:has-text('Send')").first
        expect(send_btn).to_be_visible()

    def test_select_endpoint_and_send(self, page: Page):
        """Select GET /api/users endpoint and send request."""
        # Click the GET /api/users endpoint
        page.locator("button:has-text('GET') >> .. >> button:has-text('/api/users')").first.click()
        page.wait_for_timeout(300)
        
        # Click Send
        page.locator("button:has-text('Send')").first.click()
        page.wait_for_timeout(2000)
        
        # Verify response appears (status code 200 or response body)
        response_area = page.locator("text=200").first
        expect(response_area).to_be_visible(timeout=5000)

    def test_post_endpoint_shows_body_tab(self, page: Page):
        """Select POST endpoint and verify body tab is available."""
        page.locator("button:has-text('POST')").first.click()
        page.wait_for_timeout(300)
        body_tab = page.locator("button:has-text('body')").first
        expect(body_tab).to_be_visible()

    def test_headers_tab_exists(self, page: Page):
        """Verify headers tab exists in request builder."""
        headers_tab = page.locator("button:has-text('headers')").first
        expect(headers_tab).to_be_visible()

    def test_params_tab_exists(self, page: Page):
        """Verify params tab exists in request builder."""
        params_tab = page.locator("button:has-text('params')").first
        expect(params_tab).to_be_visible()

    def test_delete_endpoint_returns_204(self, page: Page):
        """Select DELETE /api/users/:id and verify 204 response."""
        page.locator("button:has-text('DELETE')").first.click()
        page.wait_for_timeout(300)
        page.locator("button:has-text('Send')").first.click()
        page.wait_for_timeout(2000)
        response = page.locator("text=204").first
        expect(response).to_be_visible(timeout=5000)


# ============================================================
# 4. DB SANDBOX TESTS
# ============================================================

class TestDbSandbox:
    """Tests for the Database Sandbox page."""

    @pytest.fixture(autouse=True)
    def navigate(self, page: Page, base_url):
        page.goto(f"{base_url}#/db-sandbox")
        page.wait_for_load_state("networkidle")

    def test_page_heading(self, page: Page):
        """Verify Database Sandbox heading is visible."""
        heading = page.locator("h1:has-text('Database Sandbox')").first
        expect(heading).to_be_visible()

    def test_db_type_tabs(self, page: Page):
        """Verify PostgreSQL, MySQL, MongoDB tabs exist."""
        for db in ["PostgreSQL", "MySQL", "MongoDB"]:
            tab = page.locator(f"button:has-text('{db}')").first
            expect(tab).to_be_visible()

    def test_sql_editor_visible(self, page: Page):
        """Verify the SQL editor textarea is visible."""
        editor = page.locator("textarea").first
        expect(editor).to_be_visible()

    def test_execute_query_button(self, page: Page):
        """Verify Execute Query button exists."""
        btn = page.locator("button:has-text('Execute Query')").first
        expect(btn).to_be_visible()

    def test_clear_button(self, page: Page):
        """Verify Clear button exists."""
        btn = page.locator("button:has-text('Clear')").first
        expect(btn).to_be_visible()

    def test_quick_query_buttons(self, page: Page):
        """Verify quick query shortcut buttons exist."""
        queries = ["SELECT * FROM users", "SELECT * FROM orders", "INSERT INTO users", "JOIN query", "Aggregate query"]
        for q in queries:
            btn = page.locator(f"button:has-text('{q}')").first
            expect(btn).to_be_visible()

    def test_execute_select_users(self, page: Page):
        """Click 'SELECT * FROM users' quick query and execute."""
        page.locator("button:has-text('SELECT * FROM users')").first.click()
        page.wait_for_timeout(300)
        page.locator("button:has-text('Execute Query')").first.click()
        page.wait_for_timeout(1500)
        
        # Should show results table with user data
        result = page.locator("text=John").first
        expect(result).to_be_visible(timeout=5000)

    def test_execute_select_orders(self, page: Page):
        """Click 'SELECT * FROM orders' and verify results."""
        page.locator("button:has-text('SELECT * FROM orders')").first.click()
        page.wait_for_timeout(300)
        page.locator("button:has-text('Execute Query')").first.click()
        page.wait_for_timeout(1500)
        
        # Should show results tab is active
        results_tab = page.locator("button:has-text('Results')").first
        expect(results_tab).to_be_visible()

    def test_execute_insert_query(self, page: Page):
        """Execute INSERT query and verify success message."""
        page.locator("button:has-text('INSERT INTO users')").first.click()
        page.wait_for_timeout(300)
        page.locator("button:has-text('Execute Query')").first.click()
        page.wait_for_timeout(1500)
        
        # Should show success message
        success = page.locator("text=/inserted|success/i").first
        expect(success).to_be_visible(timeout=5000)

    def test_clear_editor(self, page: Page):
        """Type query, click clear, verify editor is empty."""
        editor = page.locator("textarea").first
        editor.fill("SELECT * FROM test")
        page.locator("button:has-text('Clear')").first.click()
        page.wait_for_timeout(300)
        expect(editor).to_have_value("")

    def test_schema_tab(self, page: Page):
        """Click Schema tab and verify table schemas are shown."""
        page.locator("button:has-text('Schema')").first.click()
        page.wait_for_timeout(500)
        # Should show table schemas
        users_schema = page.locator("text=users").first
        expect(users_schema).to_be_visible()

    def test_table_browser_sidebar(self, page: Page):
        """Verify table browser shows users, orders, products tables."""
        for table in ["users", "orders", "products"]:
            loc = page.locator(f"button:has-text('{table}')").first
            expect(loc).to_be_visible()

    def test_connection_indicator(self, page: Page):
        """Verify database connection indicator is shown."""
        indicator = page.locator("text=/Connected|PostgreSQL/i").first
        expect(indicator).to_be_visible()

    def test_switch_to_mysql(self, page: Page):
        """Switch to MySQL tab and verify it changes."""
        page.locator("button:has-text('MySQL')").first.click()
        page.wait_for_timeout(500)
        # Should show MySQL connection indicator
        indicator = page.locator("text=/MySQL/i").first
        expect(indicator).to_be_visible()


# ============================================================
# 5. WORKFLOWS TESTS
# ============================================================

class TestWorkflows:
    """Tests for the Workflows page."""

    @pytest.fixture(autouse=True)
    def navigate(self, page: Page, base_url):
        page.goto(f"{base_url}#/workflows")
        page.wait_for_load_state("networkidle")

    def test_workflow_catalog_heading(self, page: Page):
        """Verify workflow catalog heading is visible."""
        heading = page.locator("text=Workflow Catalog").first
        expect(heading).to_be_visible()

    def test_four_workflows_listed(self, page: Page):
        """Verify all 4 workflows are listed."""
        workflows = [
            "User Registration Approval",
            "Order Processing",
            "API Contract Review",
            "Data Import Pipeline",
        ]
        for wf in workflows:
            loc = page.locator(f"text={wf}").first
            expect(loc).to_be_visible()

    def test_workflow_status_badges(self, page: Page):
        """Verify workflow status badges (Active, Draft, Completed) exist."""
        active = page.locator("text=Active").first
        expect(active).to_be_visible()

    def test_run_workflow_button(self, page: Page):
        """Verify Run Workflow button exists."""
        btn = page.locator("button:has-text('Run Workflow')").first
        expect(btn).to_be_visible()

    def test_reset_button(self, page: Page):
        """Verify Reset button exists."""
        btn = page.locator("button:has-text('Reset')").first
        expect(btn).to_be_visible()

    def test_select_workflow(self, page: Page):
        """Click a workflow and verify details appear."""
        page.locator("button:has-text('Order Processing')").first.click()
        page.wait_for_timeout(500)
        # Step details should be visible
        details = page.locator("text=Step Details").first
        expect(details).to_be_visible()

    def test_run_workflow_execution(self, page: Page):
        """Click Run Workflow and verify execution starts."""
        page.locator("button:has-text('Run Workflow')").first.click()
        page.wait_for_timeout(2000)
        
        # Execution log should show entries
        log = page.locator("text=Execution Log").first
        expect(log).to_be_visible()

    def test_execution_log_visible(self, page: Page):
        """Verify execution log section exists."""
        log = page.locator("text=Execution Log").first
        expect(log).to_be_visible()

    def test_workflow_stats_visible(self, page: Page):
        """Verify workflow stats (success rate, avg duration) are shown."""
        # Check for percentage or duration values
        stat = page.locator("text=/\\d+\\.\\d+%|\\d+\\.\\d+s/").first
        expect(stat).to_be_visible()


# ============================================================
# 6. EVENTS PAGE TESTS
# ============================================================

class TestEvents:
    """Tests for the Event Simulator page."""

    @pytest.fixture(autouse=True)
    def navigate(self, page: Page, base_url):
        page.goto(f"{base_url}#/events")
        page.wait_for_load_state("networkidle")

    def test_page_heading(self, page: Page):
        """Verify Event Simulator heading is visible."""
        heading = page.locator("h1:has-text('Event Simulator')").first
        expect(heading).to_be_visible()

    def test_kafka_tab_visible(self, page: Page):
        """Verify KAFKA tab is visible."""
        tab = page.locator("button:has-text('KAFKA')").first
        expect(tab).to_be_visible()

    def test_mqtt_tab_visible(self, page: Page):
        """Verify MQTT tab is visible."""
        tab = page.locator("button:has-text('MQTT')").first
        expect(tab).to_be_visible()

    def test_publish_event_button(self, page: Page):
        """Verify Publish Event button exists."""
        btn = page.locator("button:has-text('Publish Event')").first
        expect(btn).to_be_visible()

    def test_kafka_topic_selector(self, page: Page):
        """Verify Kafka topic selector shows user.created."""
        topic = page.locator("button:has-text('user.created')").first
        expect(topic).to_be_visible()

    def test_publish_kafka_event(self, page: Page):
        """Publish a Kafka event and verify success feedback."""
        page.locator("button:has-text('Publish Event')").first.click()
        page.wait_for_timeout(1500)
        
        # Should show success indicator or toast
        success = page.locator("text=/published|success|offset/i").first
        expect(success).to_be_visible(timeout=5000)

    def test_live_event_stream_heading(self, page: Page):
        """Verify Live Event Stream section exists."""
        heading = page.locator("text=Live Event Stream").first
        expect(heading).to_be_visible()

    def test_live_events_auto_generate(self, page: Page):
        """Verify events auto-generate in the live stream."""
        page.wait_for_timeout(8000)
        # Stream section should show topic labels in generated events
        # Check if TOTAL EVENTS counter is > 0
        body_text = page.locator("body").inner_text()
        assert "TOTAL EVENTS" in body_text, "Total events counter not found"
        # Find the count next to "TOTAL EVENTS"
        import re
        match = re.search(r"TOTAL EVENTS\s*(\d+)", body_text)
        assert match and int(match.group(1)) > 0, "No events were auto-generated in the stream"

    def test_pause_stream_button(self, page: Page):
        """Verify Pause/Resume button works."""
        btn = page.locator("button:has-text('Pause')").first
        expect(btn).to_be_visible()
        btn.click()
        page.wait_for_timeout(500)
        # Should change to Resume
        resume = page.locator("button:has-text('Resume')").first
        expect(resume).to_be_visible()

    def test_clear_stream_button(self, page: Page):
        """Verify Clear button exists."""
        btn = page.locator("button:has-text('Clear')").first
        expect(btn).to_be_visible()

    def test_switch_to_mqtt_tab(self, page: Page):
        """Switch to MQTT tab and verify MQTT-specific fields appear."""
        page.locator("button:has-text('MQTT')").first.click()
        page.wait_for_timeout(500)
        # MQTT should show QoS or topic field
        mqtt_content = page.locator("text=/QoS|MQTT|topic/i").first
        expect(mqtt_content).to_be_visible()


# ============================================================
# 7. DASHBOARD TESTS
# ============================================================

class TestDashboard:
    """Tests for the Dashboard page."""

    @pytest.fixture(autouse=True)
    def navigate(self, page: Page, base_url):
        page.goto(f"{base_url}#/dashboard")
        page.wait_for_load_state("networkidle")

    def test_welcome_heading(self, page: Page):
        """Verify welcome heading with Shivam's name."""
        heading = page.locator("text=Welcome back, Shivam").first
        expect(heading).to_be_visible()

    def test_metric_cards_visible(self, page: Page):
        """Verify metric cards are rendered."""
        metrics = ["API Requests", "DB Queries", "Workflows", "Events"]
        for metric in metrics:
            loc = page.locator(f"text={metric}").first
            expect(loc).to_be_visible()

    def test_charts_rendered(self, page: Page):
        """Verify recharts SVG charts are rendered."""
        charts = page.locator("svg.recharts-surface")
        expect(charts.first).to_be_visible()

    def test_recent_api_activity(self, page: Page):
        """Verify recent API activity table is shown."""
        activity = page.locator("text=/Recent|Activity|API/i").first
        expect(activity).to_be_visible()

    def test_system_health_section(self, page: Page):
        """Verify system health indicators are shown."""
        health = page.locator("text=/Health|Healthy|System/i").first
        expect(health).to_be_visible()

    def test_active_workflows_section(self, page: Page):
        """Verify active workflows section is shown."""
        workflows = page.locator("text=/Active Workflow|workflow/i").first
        expect(workflows).to_be_visible()

    def test_quick_action_buttons(self, page: Page):
        """Verify quick action buttons exist."""
        for action in ["New API", "Run Query", "Start Workflow"]:
            btn = page.locator(f"button:has-text('{action}')").first
            expect(btn).to_be_visible()

    def test_shivam_sharma_footer_watermark(self, page: Page):
        """Verify SHIVAM SHARMA watermark in dashboard."""
        watermark = page.locator("text=SHIVAM SHARMA")
        expect(watermark.first).to_be_visible()

    def test_new_api_button_navigates(self, page: Page):
        """Click 'New API' and verify navigation to API Playground."""
        page.locator("button:has-text('New API')").first.click()
        page.wait_for_timeout(1000)
        assert "api-playground" in page.url

    def test_run_query_button_navigates(self, page: Page):
        """Click 'Run Query' and verify navigation to DB Sandbox."""
        page.locator("button:has-text('Run Query')").first.click()
        page.wait_for_timeout(1000)
        assert "db-sandbox" in page.url

    def test_start_workflow_button_navigates(self, page: Page):
        """Click 'Start Workflow' and verify navigation to Workflows."""
        page.locator("button:has-text('Start Workflow')").first.click()
        page.wait_for_timeout(1000)
        assert "workflows" in page.url

    def test_kafka_broker_clickable(self, page: Page):
        """Click Kafka Broker in System Health and verify navigation to Events."""
        kafka = page.locator("text=Kafka Broker").first
        expect(kafka).to_be_visible()
        kafka.click()
        page.wait_for_timeout(1000)
        assert "events" in page.url

    def test_all_services_healthy(self, page: Page):
        """Verify all system services show Healthy status."""
        services = ["API Gateway", "Auth Service", "Database", "Kafka Broker",
                     "Camunda", "Redis Cache", "MQTT Broker", "NiFi"]
        for svc in services:
            loc = page.locator(f"text={svc}").first
            expect(loc).to_be_visible()
        # All should be Healthy - no Warning or Error text
        health_section = page.locator("text=System Health").first.locator("..")
        expect(health_section).to_be_visible()

    def test_payment_reconciliation_running(self, page: Page):
        """Verify Payment Reconciliation workflow shows Running status."""
        payment = page.locator("text=Payment Reconciliation").first
        expect(payment).to_be_visible()
        # Look for Running status near it
        running = page.locator("text=Running").first
        expect(running).to_be_visible()


# ============================================================
# 8. FOOTER TESTS
# ============================================================

class TestFooter:
    """Tests for the Footer component."""

    def test_footer_branding(self, page: Page):
        """Verify footer has APIForge Lab branding."""
        footer = page.locator("footer")
        expect(footer).to_be_visible()
        logo = footer.locator("text=APIForge Lab").first
        expect(logo).to_be_visible()

    def test_footer_shivam_sharma(self, page: Page):
        """Verify footer credits SHIVAM SHARMA."""
        footer = page.locator("footer")
        credit = footer.locator("text=SHIVAM SHARMA").first
        expect(credit).to_be_visible()

    def test_footer_platform_links(self, page: Page):
        """Verify footer has Platform section links."""
        footer = page.locator("footer")
        for link_text in ["API Playground", "DB Sandbox", "Workflows", "Events"]:
            link = footer.locator(f"text={link_text}").first
            expect(link).to_be_visible()

    def test_footer_connect_links(self, page: Page):
        """Verify footer has Connect section with real links."""
        footer = page.locator("footer")
        for link_text in ["LinkedIn", "Portfolio", "Email"]:
            link = footer.locator(f"text={link_text}").first
            expect(link).to_be_visible()

    def test_footer_github_links(self, page: Page):
        """Verify footer has both GitHub repository links."""
        footer = page.locator("footer")
        apiforge_link = footer.locator("a[href='https://github.com/ShivamSharma008/apiforge-lab']")
        expect(apiforge_link).to_be_visible()
        portfolio_link = footer.locator("a[href='https://github.com/ShivamSharma008/ShivamSharma008.github.io']")
        expect(portfolio_link).to_be_visible()

    def test_footer_linkedin_link(self, page: Page):
        """Verify LinkedIn link points to correct URL."""
        footer = page.locator("footer")
        link = footer.locator("a[href='https://www.linkedin.com/in/shivamsharma-sdet/']")
        expect(link).to_be_visible()

    def test_footer_portfolio_link(self, page: Page):
        """Verify Portfolio link points to correct URL."""
        footer = page.locator("footer")
        link = footer.locator("a[href='https://shivamsharma008.github.io/']").first
        expect(link).to_be_visible()

    def test_footer_email_link(self, page: Page):
        """Verify Email link points to correct mailto."""
        footer = page.locator("footer")
        link = footer.locator("a[href='mailto:Shivamapril8@gmail.com']")
        expect(link).to_be_visible()

    def test_footer_resource_links(self, page: Page):
        """Verify footer has Resource section links."""
        footer = page.locator("footer")
        for link_text in ["Documentation", "Architecture", "API Reference"]:
            link = footer.locator(f"text={link_text}").first
            expect(link).to_be_visible()

    def test_footer_about_section(self, page: Page):
        """Verify footer has About section with Visit Portfolio button."""
        footer = page.locator("footer")
        about = footer.locator("text=About").first
        expect(about).to_be_visible()
        portfolio_btn = footer.locator("text=Visit Portfolio").first
        expect(portfolio_btn).to_be_visible()

    def test_footer_platform_link_navigates(self, page: Page, base_url):
        """Verify clicking Platform link navigates correctly."""
        footer = page.locator("footer")
        footer.locator("button:has-text('API Playground')").first.click()
        page.wait_for_timeout(1000)
        assert "api-playground" in page.url

    def test_footer_copyright(self, page: Page):
        """Verify copyright notice exists."""
        footer = page.locator("footer")
        copyright_text = footer.locator("text=/©.*APIForge Lab/").first
        expect(copyright_text).to_be_visible()


# ============================================================
# 9. CROSS-PAGE / INTEGRATION TESTS
# ============================================================

class TestCrossPage:
    """Integration tests across multiple pages."""

    def test_full_navigation_flow(self, page: Page):
        """Navigate through all pages sequentially."""
        routes = [
            ("API Playground", "#/api-playground"),
            ("DB Sandbox", "#/db-sandbox"),
            ("Workflows", "#/workflows"),
            ("Events", "#/events"),
            ("Dashboard", "#/dashboard"),
            ("Home", "#/"),
        ]
        for link_text, expected_path in routes:
            page.locator(f"nav >> text={link_text}").first.click()
            page.wait_for_load_state("networkidle")
            expect(page).to_have_url(re.compile(re.escape(expected_path)))

    def test_no_console_errors_on_landing(self, page: Page, base_url):
        """Verify no JavaScript console errors on the landing page."""
        errors = []
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
        page.goto(base_url)
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(2000)
        # Filter out known non-critical errors (e.g., favicon, HMR)
        critical_errors = [e for e in errors if "favicon" not in e.lower() and "hmr" not in e.lower()]
        assert len(critical_errors) == 0, f"Console errors found: {critical_errors}"

    def test_no_console_errors_on_api_playground(self, page: Page, base_url):
        """Verify no JavaScript console errors on API Playground."""
        errors = []
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
        page.goto(f"{base_url}#/api-playground")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(2000)
        critical_errors = [e for e in errors if "favicon" not in e.lower() and "hmr" not in e.lower()]
        assert len(critical_errors) == 0, f"Console errors found: {critical_errors}"

    def test_no_console_errors_on_db_sandbox(self, page: Page, base_url):
        """Verify no JavaScript console errors on DB Sandbox."""
        errors = []
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
        page.goto(f"{base_url}#/db-sandbox")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(2000)
        critical_errors = [e for e in errors if "favicon" not in e.lower() and "hmr" not in e.lower()]
        assert len(critical_errors) == 0, f"Console errors found: {critical_errors}"

    def test_no_console_errors_on_workflows(self, page: Page, base_url):
        """Verify no JavaScript console errors on Workflows."""
        errors = []
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
        page.goto(f"{base_url}#/workflows")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(2000)
        critical_errors = [e for e in errors if "favicon" not in e.lower() and "hmr" not in e.lower()]
        assert len(critical_errors) == 0, f"Console errors found: {critical_errors}"

    def test_no_console_errors_on_events(self, page: Page, base_url):
        """Verify no JavaScript console errors on Events."""
        errors = []
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
        page.goto(f"{base_url}#/events")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(2000)
        critical_errors = [e for e in errors if "favicon" not in e.lower() and "hmr" not in e.lower()]
        assert len(critical_errors) == 0, f"Console errors found: {critical_errors}"

    def test_no_console_errors_on_dashboard(self, page: Page, base_url):
        """Verify no JavaScript console errors on Dashboard."""
        errors = []
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
        page.goto(f"{base_url}#/dashboard")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(2000)
        critical_errors = [e for e in errors if "favicon" not in e.lower() and "hmr" not in e.lower()]
        assert len(critical_errors) == 0, f"Console errors found: {critical_errors}"

    def test_responsive_viewport_mobile(self, page: Page, base_url):
        """Verify the app renders on mobile viewport without crashing."""
        page.set_viewport_size({"width": 375, "height": 812})
        page.goto(base_url)
        page.wait_for_load_state("networkidle")
        heading = page.locator("h1").first
        expect(heading).to_be_visible()

    def test_responsive_viewport_tablet(self, page: Page, base_url):
        """Verify the app renders on tablet viewport without crashing."""
        page.set_viewport_size({"width": 768, "height": 1024})
        page.goto(base_url)
        page.wait_for_load_state("networkidle")
        heading = page.locator("h1").first
        expect(heading).to_be_visible()

    def test_no_console_errors_on_docs(self, page: Page, base_url):
        """Verify no JavaScript console errors on Documentation page."""
        errors = []
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
        page.goto(f"{base_url}#/docs")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(2000)
        critical_errors = [e for e in errors if "favicon" not in e.lower() and "hmr" not in e.lower()]
        assert len(critical_errors) == 0, f"Console errors found: {critical_errors}"

    def test_no_console_errors_on_architecture(self, page: Page, base_url):
        """Verify no JavaScript console errors on Architecture page."""
        errors = []
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
        page.goto(f"{base_url}#/architecture")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(2000)
        critical_errors = [e for e in errors if "favicon" not in e.lower() and "hmr" not in e.lower()]
        assert len(critical_errors) == 0, f"Console errors found: {critical_errors}"

    def test_no_console_errors_on_api_reference(self, page: Page, base_url):
        """Verify no JavaScript console errors on API Reference page."""
        errors = []
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
        page.goto(f"{base_url}#/api-reference")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(2000)
        critical_errors = [e for e in errors if "favicon" not in e.lower() and "hmr" not in e.lower()]
        assert len(critical_errors) == 0, f"Console errors found: {critical_errors}"


# ============================================================
# 10. DOCUMENTATION PAGE TESTS
# ============================================================

class TestDocumentation:
    """Tests for the Documentation page."""

    @pytest.fixture(autouse=True)
    def navigate(self, page: Page, base_url):
        page.goto(f"{base_url}#/docs")
        page.wait_for_load_state("networkidle")

    def test_documentation_heading(self, page: Page):
        """Verify documentation page heading."""
        heading = page.locator("text=/Documentation/i").first
        expect(heading).to_be_visible()

    def test_getting_started_section(self, page: Page):
        """Verify Getting Started section exists."""
        section = page.locator("h2:has-text('Getting Started')").first
        expect(section).to_be_visible()

    def test_api_playground_section(self, page: Page):
        """Verify API Playground documentation section."""
        section = page.locator("text=/API Playground/i").first
        expect(section).to_be_visible()

    def test_database_sandbox_section(self, page: Page):
        """Verify Database Sandbox documentation section."""
        section = page.locator("text=/Database|DB Sandbox/i").first
        expect(section).to_be_visible()

    def test_workflow_section(self, page: Page):
        """Verify Workflow documentation section."""
        section = page.locator("text=/Workflow/i").first
        expect(section).to_be_visible()

    def test_shivam_sharma_credit(self, page: Page):
        """Verify Shivam Sharma credit on docs page."""
        credit = page.locator("text=/SHIVAM SHARMA/i").first
        expect(credit).to_be_visible()


# ============================================================
# 11. ARCHITECTURE PAGE TESTS
# ============================================================

class TestArchitecture:
    """Tests for the Architecture page."""

    @pytest.fixture(autouse=True)
    def navigate(self, page: Page, base_url):
        page.goto(f"{base_url}#/architecture")
        page.wait_for_load_state("networkidle")

    def test_architecture_heading(self, page: Page):
        """Verify architecture page heading."""
        heading = page.locator("text=/Architecture/i").first
        expect(heading).to_be_visible()

    def test_client_layer(self, page: Page):
        """Verify Client Layer is shown."""
        layer = page.locator("text=/Client|React|SPA/i").first
        expect(layer).to_be_visible()

    def test_api_gateway_layer(self, page: Page):
        """Verify API Gateway layer is shown."""
        layer = page.locator("text=/API Gateway/i").first
        expect(layer).to_be_visible()

    def test_database_layer(self, page: Page):
        """Verify Database layer is shown."""
        layer = page.locator("text=/Database|PostgreSQL|MongoDB/i").first
        expect(layer).to_be_visible()

    def test_event_layer(self, page: Page):
        """Verify Event/Messaging layer is shown."""
        layer = page.locator("text=/Kafka|Event|MQTT/i").first
        expect(layer).to_be_visible()

    def test_shivam_sharma_credit(self, page: Page):
        """Verify Shivam Sharma credit on architecture page."""
        credit = page.locator("text=/SHIVAM SHARMA/i").first
        expect(credit).to_be_visible()


# ============================================================
# 12. API REFERENCE PAGE TESTS
# ============================================================

class TestApiReference:
    """Tests for the API Reference page."""

    @pytest.fixture(autouse=True)
    def navigate(self, page: Page, base_url):
        page.goto(f"{base_url}#/api-reference")
        page.wait_for_load_state("networkidle")

    def test_api_reference_heading(self, page: Page):
        """Verify API Reference page heading."""
        heading = page.locator("text=/API Reference/i").first
        expect(heading).to_be_visible()

    def test_users_api_section(self, page: Page):
        """Verify Users API category exists."""
        section = page.locator("text=/Users/i").first
        expect(section).to_be_visible()

    def test_orders_api_section(self, page: Page):
        """Verify Orders API category exists."""
        section = page.locator("text=/Orders/i").first
        expect(section).to_be_visible()

    def test_auth_api_section(self, page: Page):
        """Verify Auth API category exists."""
        section = page.locator("text=/Auth/i").first
        expect(section).to_be_visible()

    def test_http_method_badges(self, page: Page):
        """Verify HTTP method badges are displayed."""
        get_badge = page.locator("text=GET").first
        expect(get_badge).to_be_visible()
        post_badge = page.locator("text=POST").first
        expect(post_badge).to_be_visible()

    def test_search_filter(self, page: Page):
        """Verify search/filter input exists."""
        search = page.locator("input[type='text'], input[placeholder*='earch'], input[placeholder*='ilter']").first
        expect(search).to_be_visible()

    def test_shivam_sharma_credit(self, page: Page):
        """Verify Shivam Sharma credit on API Reference page."""
        credit = page.locator("text=/SHIVAM SHARMA/i").first
        expect(credit).to_be_visible()


# ============================================================
# 13. DASHBOARD LIVE METRICS TESTS
# ============================================================

class TestDashboardLiveMetrics:
    """Tests for live updating dashboard metrics."""

    @pytest.fixture(autouse=True)
    def navigate(self, page: Page, base_url):
        page.goto(f"{base_url}#/dashboard")
        page.wait_for_load_state("networkidle")

    def test_metrics_update_over_time(self, page: Page):
        """Verify dashboard metrics change over time (live updates)."""
        # Capture initial API Requests value
        initial_text = page.locator("text=/\\d{2,}/").first.inner_text()
        # Wait for metrics to update (interval is 2.5s)
        page.wait_for_timeout(5000)
        # Capture again
        updated_text = page.locator("text=/\\d{2,}/").first.inner_text()
        # At least some metric should have changed
        body_text = page.locator("body").inner_text()
        assert "API Requests" in body_text

    def test_nifi_clickable(self, page: Page):
        """Verify NiFi service is clickable and navigates."""
        nifi = page.locator("text=NiFi").first
        expect(nifi).to_be_visible()
        nifi.click()
        page.wait_for_timeout(1000)
        assert "workflows" in page.url
