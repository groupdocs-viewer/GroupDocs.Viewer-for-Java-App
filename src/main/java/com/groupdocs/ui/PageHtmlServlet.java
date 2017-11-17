package com.groupdocs.ui;

import com.groupdocs.viewer.converter.options.HtmlOptions;
import com.groupdocs.viewer.domain.Watermark;
import com.groupdocs.viewer.domain.WatermarkPosition;
import com.groupdocs.viewer.domain.html.PageHtml;
import com.groupdocs.viewer.handler.ViewerHtmlHandler;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.awt.Color;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Query String parameters:
 * file: string: The name of input file in storage folder.
 * zoom: Integer: The zoom factor.
 * page: Integer: The page number that needs to be viewed.
 */
@WebServlet("/page/html")
public class PageHtmlServlet
        extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String filename = request.getParameter("file");
        if (Utils.isValidUrl(filename))
        	filename = Utils.downloadToStorage(filename);        
        response.setContentType("text/html");
        ViewerHtmlHandler handler = Utils.createViewerHtmlHandler();

        int pageNumber = Integer.valueOf(request.getParameter("page"));

        List<Integer> pageNumberstoRender = new ArrayList<>();
        pageNumberstoRender.add(pageNumber);

        HtmlOptions options = new HtmlOptions();

        options.setPageNumbersToRender(pageNumberstoRender);
        options.setPageNumber(pageNumber);
        options.setCountPagesToRender(1);
        options.setHtmlResourcePrefix("/page/resource?file="+filename+"&page="+pageNumber+"&resource=");

        String watermarkText = request.getParameter("watermarkText");
        if(watermarkText !=null && watermarkText.length()>0)
            options.setWatermark(Utils.getWatermark(watermarkText,request.getParameter("watermarkColor"),
        			request.getParameter("watermarkPosition"),request.getParameter("watermarkWidth")));
                
        List<PageHtml> list = Utils.loadPageHtmlList(handler, filename,options);
        list.stream().filter(pageHtml -> pageHtml.getPageNumber() == pageNumber).findAny().ifPresent(pageHtml -> {
            String fullHtml = pageHtml.getHtmlContent();
            try {
                response.getWriter().write(fullHtml);
            } catch (IOException x) {
                throw new UncheckedIOException(x);
            }
        });
    }
}
