#!/bin/bash

# Test script for AI Bridal Portrait Generator API
echo "🧪 Testing AI Bridal Portrait Generator API"
echo "=========================================="

API_BASE="http://localhost:3001"

# Test 1: Health check
echo "📊 Testing health endpoint..."
health_response=$(curl -s "$API_BASE/health")
if echo "$health_response" | jq -e '.status == "OK"' > /dev/null; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed: $health_response"
    exit 1
fi

# Test 2: API docs
echo "📚 Testing API documentation endpoint..."
docs_response=$(curl -s "$API_BASE/api/docs")
if echo "$docs_response" | jq -e '.title' > /dev/null; then
    echo "✅ API docs endpoint working"
else
    echo "❌ API docs failed: $docs_response"
    exit 1
fi

# Test 3: Gemini endpoint validation (no file)
echo "🔍 Testing Gemini endpoint validation..."
gemini_validation=$(curl -s -X POST "$API_BASE/api/generate/gemini")
if echo "$gemini_validation" | jq -e '.error == "Missing required parameter"' > /dev/null; then
    echo "✅ Gemini validation working"
else
    echo "❌ Gemini validation failed: $gemini_validation"
    exit 1
fi

# Test 4: Segmind endpoint validation (no files)
echo "🔍 Testing Segmind endpoint validation..."
segmind_validation=$(curl -s -X POST "$API_BASE/api/generate/segmind")
if echo "$segmind_validation" | jq -e '.error == "Missing required parameter"' > /dev/null; then
    echo "✅ Segmind validation working"
else
    echo "❌ Segmind validation failed: $segmind_validation"
    exit 1
fi

# Test 5: 404 handling
echo "🚫 Testing 404 handling..."
not_found_response=$(curl -s "$API_BASE/nonexistent")
if echo "$not_found_response" | jq -e '.error == "Not found"' > /dev/null; then
    echo "✅ 404 handling working"
else
    echo "❌ 404 handling failed: $not_found_response"
    exit 1
fi

echo ""
echo "🎉 All API tests passed!"
echo "💡 Server is ready to accept external requests"
echo ""
echo "📝 Available endpoints:"
echo "   GET  $API_BASE/health"
echo "   GET  $API_BASE/api/docs"
echo "   POST $API_BASE/api/generate/gemini"
echo "   POST $API_BASE/api/generate/segmind"
echo ""
echo "📖 See docs/api.md for complete documentation"