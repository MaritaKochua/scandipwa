/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/base-theme
 * @link https://github.com/scandipwa/scandipwa
 */

import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import Link from 'Component/Link';
import {
    ORDER_ACTION_LABELS, ORDER_ITEMS, ORDER_REFUNDS, ORDER_SHIPMENTS
} from 'Component/MyAccountOrder/MyAccountOrder.config';
import MyAccountOrderItemsTableRow from 'Component/MyAccountOrderItemsTableRow';
import MyAccountOrderTotals from 'Component/MyAccountOrderTotals';
import { OrderProductsType, OrderTabType, OrderTotalType } from 'Type/Order.type';
import { getTimeInCurrentTimezone } from 'Util/Manipulations/Date';
import { getProductFromOrder } from 'Util/Orders';
import { appendWithStoreCode } from 'Util/Url';

import './MyAccountOrderItemsTable.style';

/** @namespace Component/MyAccountOrderItemsTable/Component */
export class MyAccountOrderItemsTable extends PureComponent {
    static propTypes = {
        activeTab: PropTypes.string.isRequired,
        isMobile: PropTypes.bool.isRequired,
        items: OrderTabType.isRequired,
        total: OrderTotalType.isRequired,
        allOrderItems: OrderProductsType.isRequired,
        id: PropTypes.string.isRequired,
        isPrintPage: PropTypes.bool.isRequired
    };

    renderItems() {
        const { items: { items: products = [] } } = this.props;

        return products.map(this.renderItemRow.bind(this));
    }

    renderItemRow(product) {
        const { activeTab, allOrderItems, items: { comments = [] } } = this.props;
        const { product_sku, product_url_key } = product;
        const {
            entered_options = [],
            selected_options = []
        } = getProductFromOrder(allOrderItems, product_sku) || {};

        return (
            <MyAccountOrderItemsTableRow
              product={ product }
              selectedOptions={ selected_options }
              enteredOptions={ entered_options }
              key={ product_url_key }
              activeTab={ activeTab }
              comments={ comments }
            />
        );
    }

    renderPrintAction() {
        const { activeTab, id, isPrintPage } = this.props;

        const { print: printLabel, printUrl } = ORDER_ACTION_LABELS[activeTab] || {};

        if (!printLabel || isPrintPage) {
            return null;
        }

        return (
            <Link
              block="MyAccountOrderItemsTable"
              elem="PrintOrder"
              to={ appendWithStoreCode(`${printUrl}/${id}`) }
              isOpenInNewTab
            >
                { printLabel }
            </Link>
        );
    }

    renderOrderTitleAndActions() {
        const { activeTab, items: { number }, isMobile } = this.props;

        if (isMobile && activeTab === ORDER_ITEMS) {
            return (
                <div block="MyAccountOrderItemsTable" elem="OrderTitle">
                    { __('Items Ordered') }
                </div>
            );
        }

        return (
            <div block="MyAccountOrderItemsTable" elem="OrderActions">
                <div block="MyAccountOrderItemsTable" elem="OrderTitle">
                    { `${activeTab} # ${number}` }
                </div>
                { this.renderPrintAction() }
            </div>
        );
    }

    renderRefundsTableHeading() {
        const { activeTab } = this.props;

        if (activeTab !== ORDER_REFUNDS) {
            return null;
        }

        return (
            <>
                <th
                  block="MyAccountOrderItemsTable"
                  elem="Discount"
                >
                    { __('Discount Amount') }
                </th>
                <th
                  block="MyAccountOrderItemsTable"
                  elem="Total"
                >
                    { __('Row Total') }
                </th>
            </>
        );
    }

    renderPriceHeading() {
        const { activeTab } = this.props;

        if (activeTab === ORDER_SHIPMENTS) {
            return null;
        }

        return (
            <th
              block="MyAccountOrderItemsTable"
              elem="Price"
            >
                { __('Price') }
            </th>
        );
    }

    renderSubtotalHeading() {
        const { activeTab } = this.props;

        if (activeTab === ORDER_SHIPMENTS) {
            return null;
        }

        return (
            <th
              block="MyAccountOrderItemsTable"
              elem="Subtotal"
            >
                { __('Subtotal') }
            </th>
        );
    }

    renderItemsHeading() {
        return (
            <tr
              block="MyAccountOrderItemsTable"
              elem="Headings"
            >
                <th
                  block="MyAccountOrderItemsTable"
                  elem="Name"
                >
                    <strong>{ __('Product Name') }</strong>
                </th>
                <th
                  block="MyAccountOrderItemsTable"
                  elem="ProductSku"
                >
                    { __('SKU') }
                </th>
                { this.renderPriceHeading() }
                <th
                  block="MyAccountOrderItemsTable"
                  elem="Quantity"
                >
                    { __('Qty') }
                </th>
                { this.renderSubtotalHeading() }
                { this.renderRefundsTableHeading() }
            </tr>
        );
    }

    renderTotals() {
        const { total, activeTab } = this.props;

        if (activeTab === ORDER_SHIPMENTS) {
            return null;
        }

        return <MyAccountOrderTotals activeTab={ activeTab } total={ total } />;
    }

    renderComments() {
        const { items: { comments = [] }, activeTab, isPrintPage } = this.props;

        if (activeTab === ORDER_ITEMS || !comments.length || isPrintPage) {
            return null;
        }

        const commentOrder = comments.sort(
            ({ timestamp: first }, { timestamp: second }) => (
                new Date(second.replace(/-/g, '/')) - new Date(first.replace(/-/g, '/'))
            )
        );

        return (
            <div block="MyAccountOrderItemsTable" elem="Comments">
                <div
                  block="MyAccountOrderItemsTable"
                  elem="CommentsTitle"
                >
                    { __('About Your %s', activeTab) }
                </div>
                <div block="MyAccountOrderItemsTable" elem="CommentsList">
                    { commentOrder.map(({ timestamp, message }) => (
                        <dl
                          block="MyAccountOrderItemsTable"
                          elem="Comment"
                        >
                            <dt>{ getTimeInCurrentTimezone(timestamp) }</dt>
                            <dd>{ message }</dd>
                        </dl>
                    )) }
                </div>
            </div>
        );
    }

    render() {
        return (
            <div block="MyAccountOrderItemsTable" elem="ProductsWrapper">
                { this.renderOrderTitleAndActions() }
                <table
                  block="MyAccountOrderItemsTable"
                  elem="Products"
                >
                    <thead>
                        { this.renderItemsHeading() }
                    </thead>
                    { this.renderItems() }
                    { this.renderTotals() }
                </table>
                { this.renderComments() }
            </div>
        );
    }
}

export default MyAccountOrderItemsTable;
