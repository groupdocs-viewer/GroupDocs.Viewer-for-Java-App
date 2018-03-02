package com.groupdocs.ui;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.groupdocs.viewer.converter.options.ImageOptions;
import com.groupdocs.viewer.domain.Transformation;
import com.groupdocs.viewer.domain.containers.DocumentInfoContainer;
import com.groupdocs.viewer.domain.image.PageImage;
import com.groupdocs.viewer.domain.options.RotatePageOptions;
import com.groupdocs.viewer.handler.ViewerImageHandler;

/**
 * Query String parameters:
 * file: string: The name of input file in storage folder.
 * width: Integer: The width of output image.
 * height: Integer: The height of output image.
 * page: Integer: The page number that needs to be viewed.
 */
@WebServlet("/page/image")
public class PageImageServlet
        extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try
        {
        response.setContentType("image/png");
        ViewerImageHandler handler = Utils.createViewerImageHandler();

        String rotate= request.getParameter("rotate");
        if (rotate!=null && rotate.length()>0)
        {
            handler.clearCache();
        }

        String width= request.getParameter("width");
        String height= request.getParameter("height");
        String zoom= request.getParameter("zoom");
        String filename = request.getParameter("file");
        String file=request.getParameter("file");

        ImageOptions options = new ImageOptions();
        int pageNumber = Integer.valueOf(request.getParameter("page"));
        options.setPageNumbersToRender(Arrays.asList(pageNumber));
        options.setPageNumber(pageNumber);
        options.setCountPagesToRender(1);

        String watermarkText = request.getParameter("watermarkText");
        if(watermarkText!=null && watermarkText.length()>0)
        	options.setWatermark(Utils.getWatermark(watermarkText,request.getParameter("watermarkColor"),
        			request.getParameter("watermarkPosition"),request.getParameter("watermarkWidth")));

        if (Utils.isValidUrl(filename))
        	filename = Utils.downloadToStorage(filename);

        if(width!=null && width.length()>0) {
            if (zoom != null && zoom.length() > 0) {
                options.setWidth(Integer.parseInt(width) + Integer.parseInt(zoom));
            } else {
                options.setWidth(Integer.parseInt(width));
            }
        }

        if(height!=null && height.length()>0) {
            if (zoom != null && zoom.length() > 0) {
                options.setHeight(Integer.parseInt(height) + Integer.parseInt(zoom));
            }
        }

        if(rotate!=null && rotate.length()>0) {
            if (width != null && width.length() > 0) {

                Integer side=options.getWidth();

                DocumentInfoContainer documentInfoContainer = null;
                documentInfoContainer = handler.getDocumentInfo(file);

                int pageAngle = documentInfoContainer.getPages().get(pageNumber - 1).getAngle();
                if (pageAngle == 90 || pageAngle == 270)
                    options.setHeight(side);
                else
                    options.setWidth(side);

                options.setTransformations(Transformation.Rotate);
                handler.rotatePage(file, new RotatePageOptions(pageNumber,Integer.parseInt(rotate)));
            }
        }
        else {
            options.setTransformations(Transformation.None);
            handler.rotatePage(file, new RotatePageOptions(pageNumber,0));

        }

        List<PageImage> list = Utils.loadPageImageList(handler, filename, options);

        list.stream().filter(
                predicate -> predicate.getPageNumber() == pageNumber
        ).findAny().ifPresent(pageImage -> {
        	Utils.writeToResponse(pageImage.getStream(), response);
        	
        });
        } catch (Exception x) {
            throw new RuntimeException(x);
        }
    }
}