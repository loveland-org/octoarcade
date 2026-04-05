#!/bin/bash

# OctoArcade Load Testing Script
# This script runs comprehensive load tests on the search and dashboard endpoints

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
SERVER_URL="http://localhost:3000"
OUTPUT_DIR="./load-test-results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
SERVER_PID=""

print_header() {
    echo -e "${BLUE}=================================${NC}"
    echo -e "${BLUE}  OctoArcade Load Testing Suite  ${NC}"
    echo -e "${BLUE}=================================${NC}"
    echo
}

print_step() {
    echo -e "${YELLOW}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to check if server is running
check_server() {
    print_step "Checking if server is running..."
    if curl -s "$SERVER_URL/health" > /dev/null 2>&1; then
        print_success "Server is running at $SERVER_URL"
        return 0
    else
        print_error "Server is not running at $SERVER_URL"
        return 1
    fi
}

# Function to start the server
start_server() {
    print_step "Starting OctoArcade server..."
    cd "$(dirname "$0")/.."
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_step "Installing dependencies..."
        npm install
    fi
    
    # Start server in background
    nohup npm start > server.log 2>&1 &
    SERVER_PID=$!
    
    # Wait for server to start
    print_step "Waiting for server to start..."
    for i in {1..30}; do
        if curl -s "$SERVER_URL/health" > /dev/null 2>&1; then
            print_success "Server started successfully (PID: $SERVER_PID)"
            return 0
        fi
        sleep 1
    done
    
    print_error "Server failed to start within 30 seconds"
    return 1
}

# Function to stop the server
stop_server() {
    if [ ! -z "$SERVER_PID" ]; then
        print_step "Stopping server (PID: $SERVER_PID)..."
        kill $SERVER_PID 2>/dev/null || true
        wait $SERVER_PID 2>/dev/null || true
        print_success "Server stopped"
    fi
}

# Function to run a specific load test
run_load_test() {
    local test_name=$1
    local test_file=$2
    local output_file="$OUTPUT_DIR/${test_name}_${TIMESTAMP}.json"
    
    print_step "Running $test_name load test..."
    
    if [ ! -f "$test_file" ]; then
        print_error "Test file not found: $test_file"
        return 1
    fi
    
    # Run Artillery test with JSON output
    if npx artillery run "$test_file" --output "$output_file"; then
        print_success "$test_name load test completed"
        
        # Generate HTML report if possible
        local html_file="$OUTPUT_DIR/${test_name}_${TIMESTAMP}.html"
        if npx artillery report "$output_file" --output "$html_file" 2>/dev/null; then
            print_success "HTML report generated: $html_file"
        fi
        
        return 0
    else
        print_error "$test_name load test failed"
        return 1
    fi
}

# Function to display test results summary
show_results_summary() {
    print_step "Test Results Summary"
    echo
    echo "Results are saved in: $OUTPUT_DIR"
    echo "Timestamp: $TIMESTAMP"
    echo
    
    # List generated files
    if [ -d "$OUTPUT_DIR" ]; then
        echo "Generated files:"
        ls -la "$OUTPUT_DIR"/*"$TIMESTAMP"* 2>/dev/null || echo "No result files found"
    fi
    
    echo
    echo "To view detailed results:"
    echo "  - Open HTML reports in a web browser"
    echo "  - Analyze JSON files for detailed metrics"
    echo "  - Check server.log for server-side logs"
}

# Function to run performance monitoring
monitor_performance() {
    local duration=${1:-60}
    local interval=${2:-5}
    
    print_step "Monitoring system performance for ${duration} seconds..."
    
    local monitor_file="$OUTPUT_DIR/system_monitor_${TIMESTAMP}.log"
    echo "Timestamp,CPU%,Memory%,LoadAvg" > "$monitor_file"
    
    for ((i=0; i<duration; i+=interval)); do
        local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
        local mem_usage=$(free | grep Mem | awk '{printf "%.1f", ($3/$2) * 100.0}')
        local load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
        
        echo "$timestamp,$cpu_usage,$mem_usage,$load_avg" >> "$monitor_file"
        sleep $interval
    done
    
    print_success "Performance monitoring completed"
}

# Cleanup function
cleanup() {
    stop_server
    exit $1
}

# Set up signal handlers
trap 'cleanup 1' INT TERM

# Main execution
main() {
    print_header
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --server-url)
                SERVER_URL="$2"
                shift 2
                ;;
            --output-dir)
                OUTPUT_DIR="$2"
                shift 2
                ;;
            --start-server)
                START_SERVER=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --server-url URL     Server URL (default: http://localhost:3000)"
                echo "  --output-dir DIR     Output directory (default: ./load-test-results)"
                echo "  --start-server       Start server automatically"
                echo "  --help              Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Create output directory
    mkdir -p "$OUTPUT_DIR"
    
    # Check or start server
    if [ "$START_SERVER" = true ]; then
        start_server || cleanup 1
    else
        check_server || {
            echo "Use --start-server to automatically start the server"
            cleanup 1
        }
    fi
    
    print_step "Starting load test suite..."
    echo "Server URL: $SERVER_URL"
    echo "Output Directory: $OUTPUT_DIR"
    echo "Timestamp: $TIMESTAMP"
    echo
    
    # Start performance monitoring in background
    monitor_performance 600 5 &
    MONITOR_PID=$!
    
    # Run load tests
    local tests_passed=0
    local tests_failed=0
    
    # Search endpoint tests
    if run_load_test "search" "./tests/load/search-test.yml"; then
        ((tests_passed++))
    else
        ((tests_failed++))
    fi
    
    # Dashboard endpoint tests
    if run_load_test "dashboard" "./tests/load/dashboard-test.yml"; then
        ((tests_passed++))
    else
        ((tests_failed++))
    fi
    
    # Combined stress test
    if run_load_test "combined" "./tests/load/combined-test.yml"; then
        ((tests_passed++))
    else
        ((tests_failed++))
    fi
    
    # Stop performance monitoring
    if [ ! -z "$MONITOR_PID" ]; then
        kill $MONITOR_PID 2>/dev/null || true
    fi
    
    # Show results
    echo
    print_step "Load Testing Completed"
    echo "Tests passed: $tests_passed"
    echo "Tests failed: $tests_failed"
    echo
    
    show_results_summary
    
    # Cleanup
    if [ "$START_SERVER" = true ]; then
        stop_server
    fi
    
    # Exit with appropriate code
    if [ $tests_failed -gt 0 ]; then
        cleanup 1
    else
        cleanup 0
    fi
}

# Run main function
main "$@"