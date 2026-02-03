
"use client";

import React, { useState, useMemo } from "react";
import { routeDocs, RouteDoc } from "@/data/route-docs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/Accordion";
import Link from "next/link";

export default function RouteDocs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(routeDocs.map((doc) => doc.category)))];

  const filteredDocs = useMemo(() => {
    return routeDocs.filter((doc) => {
      const matchesSearch =
        doc.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.faqs.some(
          (faq) =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory = selectedCategory === "All" || doc.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "POST":
        return "bg-green-100 text-green-800 border-green-200";
      case "PUT":
      case "PATCH":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "DELETE":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur py-4 border-b border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <h1 className="text-2xl font-bold text-slate-900">Route Documentation</h1>
          <div className="relative w-full md:w-96">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-400">search</span>
            </span>
            <input
              type="text"
              placeholder="Search routes, descriptions, or FAQs..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content List */}
      <div className="grid gap-6">
        {filteredDocs.length > 0 ? (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              id={doc.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden scroll-mt-32"
            >
              {/* Route Header */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getMethodColor(
                        doc.method
                      )}`}
                    >
                      {doc.method}
                    </span>
                    <code className="text-lg font-semibold text-slate-800 font-mono">{doc.path}</code>
                  </div>
                  <span className="text-sm text-slate-500 px-2 py-1 bg-slate-50 rounded">
                    {doc.category}
                  </span>
                </div>
                <p className="text-slate-600">{doc.description}</p>
              </div>

              {/* FAQ Accordion */}
              <div className="bg-slate-50/50 p-6">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                  Frequently Asked Questions
                </h3>
                <Accordion type="multiple" className="bg-white rounded-lg border border-slate-200 shadow-sm">
                  {doc.faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`faq-${doc.id}-${index}`}>
                      <AccordionTrigger className="px-4 text-left text-sm text-slate-700 hover:text-blue-600">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 text-slate-600">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-500">
            <span className="material-symbols-outlined text-4xl mb-2">sentiment_dissatisfied</span>
            <p>No documentation found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
